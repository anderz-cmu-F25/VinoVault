/**
 * Core price-drop monitoring logic using the Observer design pattern.
 *
 * Architecture:
 *   PriceDropSubject   — maintains a list of observers and broadcasts events
 *   PriceDropObserver  — interface every notification channel must implement
 *   EmailObserver      — sends a price-drop email via Nodemailer
 *   NotificationObserver — persists the event to MongoDB for the frontend
 *
 * Adding a new notification channel (e.g. SMS, push) only requires:
 *   1. Implement PriceDropObserver
 *   2. subject.subscribe(new SmsObserver())  ← no other code changes needed
 */

import { connectDB } from "./db";
import { Wishlist } from "./models/Wishlist";
import { Wine } from "./models/Wine";
import { Notification } from "./models/Notification";
import { sendPriceAlertEmail } from "./email";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PriceDropEvent {
  email: string;
  wineId: string;
  wineName: string;
  previousPrice: number | null;
  currentPrice: number;
  targetPrice: number;
  wineUrl: string;
}

export interface PriceDropObserver {
  update(event: PriceDropEvent): Promise<void>;
}

// ── Subject ───────────────────────────────────────────────────────────────────

export class PriceDropSubject {
  private observers: PriceDropObserver[] = [];

  subscribe(observer: PriceDropObserver): void {
    this.observers.push(observer);
  }

  /** Broadcasts the event to all registered observers in parallel. */
  async notify(event: PriceDropEvent): Promise<void> {
    await Promise.all(this.observers.map((obs) => obs.update(event)));
  }
}

// ── Concrete Observers ────────────────────────────────────────────────────────

/** Sends a formatted HTML email to the user via SMTP. */
export class EmailObserver implements PriceDropObserver {
  async update(event: PriceDropEvent): Promise<void> {
    try {
      await sendPriceAlertEmail({
        email:        event.email,
        wineName:     event.wineName,
        targetPrice:  event.targetPrice,
        currentPrice: event.currentPrice,
        wineUrl:      event.wineUrl,
      });
      console.log(`[EmailObserver] Email sent to ${event.email}`);
    } catch (err) {
      // Log but don't throw — a failed email must not block other observers
      console.error(`[EmailObserver] Failed for ${event.email}:`, err);
    }
  }
}

/** Persists the price-drop event to MongoDB so the frontend can display it. */
export class NotificationObserver implements PriceDropObserver {
  async update(event: PriceDropEvent): Promise<void> {
    try {
      await Notification.create({
        email:         event.email,
        wineId:        event.wineId,
        wineName:      event.wineName,
        previousPrice: event.previousPrice,
        currentPrice:  event.currentPrice,
        targetPrice:   event.targetPrice,
      });
      console.log(`[NotificationObserver] Saved notification for ${event.email}`);
    } catch (err) {
      console.error(`[NotificationObserver] Failed for ${event.email}:`, err);
    }
  }
}

// ── Main monitor function ─────────────────────────────────────────────────────

export interface MonitorResult {
  checked: number;
  alerted: number;
}

export async function runMonitor(): Promise<MonitorResult> {
  await connectDB();
  console.log("[monitor] Connected to MongoDB");

  const pendingItems = await Wishlist.find({ isNotified: false }).lean();
  console.log(`[monitor] Found ${pendingItems.length} unnotified wishlist item(s)`);

  // Wire up the subject with all notification channels
  const subject = new PriceDropSubject();
  subject.subscribe(new EmailObserver());
  subject.subscribe(new NotificationObserver());

  let alerted = 0;

  for (const item of pendingItems) {
    try {
      const wine = await Wine.findOne({ wineId: item.wineId });

      if (!wine) {
        console.log(`[monitor] Wine not found for wineId "${item.wineId}", skipping`);
        continue;
      }

      if (wine.salePrice !== null && wine.salePrice <= item.targetPrice) {
        await subject.notify({
          email:         item.email,
          wineId:        item.wineId,
          wineName:      wine.name,
          previousPrice: wine.regularPrice,
          currentPrice:  wine.salePrice,
          targetPrice:   item.targetPrice,
          wineUrl:       `https://www.wine.com/product/${item.wineId}`,
        });

        await Wishlist.updateOne({ _id: item._id }, { isNotified: true });
        console.log(`[monitor] Alerted ${item.email} for "${wine.name}"`);
        alerted++;
      } else {
        console.log(
          `[monitor] No alert for "${wine.name}" — $${wine.salePrice} > target $${item.targetPrice}`
        );
      }
    } catch (err) {
      console.error(`[monitor] Error processing item ${item._id}:`, err);
    }
  }

  console.log(`[monitor] Done — checked: ${pendingItems.length}, alerted: ${alerted}`);
  return { checked: pendingItems.length, alerted };
}
