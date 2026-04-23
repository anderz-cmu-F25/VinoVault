# Wine Inventory Management — Implementation Plan

> Branch: `inventory`  
> Pattern: **Builder** (CellarEntryBuilder + Director)  
> Status: [x] Complete

---

## What to Reuse (No Changes Needed)

### Backend
| File | How it's used |
|---|---|
| `server/src/common/middleware/auth.middleware.js` | Apply to all inventory routes — extracts `req.auth.userId` |
| `server/src/app.js` | Add one line: `app.use("/api/inventory", inventoryRoutes)` |
| `server/src/server.js` | No changes needed |

### Frontend
| File | How it's used |
|---|---|
| `client/src/app/routes.tsx` | `/cellar` route already defined, protected, points to `CellarPage` |
| `client/src/app/components/NavigationBar.tsx` | Cellar nav link already wired |
| `client/src/app/components/ui/*` | Use `Dialog`, `Input`, `Button`, `Card`, `Badge`, etc. |
| `client/src/styles/theme.css` | Wine-red `#722F37`, cream `#FDF6EE`, gold `#C9A96E` |
| `client/src/app/components/AddWineModal.tsx` | Reference/template for AddCellarEntryModal |
| `client/src/app/components/WineCard.tsx` | Reference/template for CellarEntryCard |
| `client/src/app/components/EmptyWishlist.tsx` | Reference/template for EmptyCellar state |

---

## What to Build

### Backend

#### 1. Builder Pattern Classes
> Location: `server/src/modules/inventory/builder/`

- [x] `Builder.js` — interface declaring all setter steps:
  - `reset()`, `setUser(userId)`, `setWineInfo(wineId, name, winery, type, region)`
  - `setVintage(vintage)`, `setQuantity(quantity)`, `setPurchaseDate(date)`
  - `setStorageLocation(location)`, `setStatus(status)`, `setNotes(notes)`
  - `getResult()` — validates required fields, returns `CellarEntry`
- [x] `CellarEntryBuilder.js` — concrete builder implementing `Builder.js`
  - Holds internal `entry` object, sets fields step by step
  - `loadExistingEntry(entryId)` — loads from DB, used for edits
  - `getResult()` — throws if `userId` or `wineId` missing
- [x] `Director.js` — orchestrates builder steps per workflow:
  - `makeFromInventory(builder, userId, wineId, ...)` — full wine info from catalog
  - `makeManualEntry(builder, userId, name, ...)` — user-typed wine info
  - `editExistingEntry(builder, entryId, changedFields)` — partial update

#### 2. Mongoose Models
> Location: `server/src/modules/inventory/`

- [x] `wine.model.js` — shared wine catalog (one doc per wine)
  - Fields: `wineName` (String, required), `winery` (String), `type` (String: red/white/rosé/sparkling/dessert), `region` (String), `grapes` (String), `vintage` (Number)
  - Timestamps: yes

- [x] `cellarEntry.model.js` — per-user cellar entry
  - Fields: `userId` (String, required, index), `wineId` (ObjectId ref Wine, required), `wineName` (String), `winery` (String), `type` (String), `region` (String), `vintage` (Number), `quantity` (Number, required, default 1), `purchaseDate` (String), `storageLocation` (String), `status` (String: enum `storing/ready/consumed`, default `storing`), `notes` (String)
  - Timestamps: yes
  - Index on `userId`

#### 3. Repository
> `server/src/modules/inventory/cellar.repository.js`

- [x] `findAllByUserId(userId)` — list user's cellar
- [x] `findEntryById(entryId)` — fetch single entry
- [x] `createEntry(data)` — save new cellar entry
- [x] `updateEntry(entryId, userId, data)` — update (scoped to userId)
- [x] `deleteEntry(entryId, userId)` — delete (scoped to userId)
- [x] `findOrCreateWine(wineData)` — upsert wine catalog entry by name+winery+vintage

#### 4. Service
> `server/src/modules/inventory/cellar.service.js`

- [x] `getCellar(userId)` — get all user's entries
- [x] `addFromCatalog(userId, wineId, entryFields)` — uses `Director.makeFromInventory()`
- [x] `addManualEntry(userId, entryFields)` — uses `Director.makeManualEntry()`
- [x] `editEntry(userId, entryId, changedFields)` — uses `Director.editExistingEntry()`
- [x] `removeEntry(userId, entryId)` — delete with ownership check
- [x] `searchWines(query)` — search wine catalog for add-wine modal autocomplete

#### 5. Controller
> `server/src/modules/inventory/cellar.controller.js`

- [x] `getCellar(req, res, next)` — `GET /api/inventory`
- [x] `addEntry(req, res, next)` — `POST /api/inventory`
- [x] `updateEntry(req, res, next)` — `PUT /api/inventory/:entryId`
- [x] `deleteEntry(req, res, next)` — `DELETE /api/inventory/:entryId`
- [x] `searchWines(req, res, next)` — `GET /api/inventory/wines/search?q=`

All controllers follow existing pattern:
```js
const userId = req.auth.userId;
if (!userId) return res.status(401).json({ message: "Unauthorized" });
// validate → call service → return res.status(200).json({ data })
```

#### 6. Routes
> `server/src/modules/inventory/inventory.routes.js`

- [x] `GET    /api/inventory` — list cellar (auth)
- [x] `POST   /api/inventory` — add entry (auth)
- [x] `PUT    /api/inventory/:entryId` — edit entry (auth)
- [x] `DELETE /api/inventory/:entryId` — delete entry (auth)
- [x] `GET    /api/inventory/wines/search` — search catalog (auth)

#### 7. Register in app.js
> `server/src/app.js`

- [x] Add `const inventoryRoutes = require("./modules/inventory/inventory.routes")`
- [x] Add `app.use("/api/inventory", inventoryRoutes)`

---

### Frontend

#### 8. CellarPage (replace placeholder)
> `client/src/app/pages/CellarPage.tsx`

- [x] Fetch `GET /api/inventory` on mount with Clerk auth token
- [x] Show loading state while fetching
- [x] Show `EmptyCellar` component when list is empty
- [x] Show list of `CellarEntryCard` components when populated
- [x] "Add Wine" button → opens `AddCellarEntryModal`
- [x] Filter/sort bar: by type, status, region
- [x] Match page layout style of `WishlistPage.tsx` (header + list)

#### 9. CellarEntryCard component
> `client/src/app/components/CellarEntryCard.tsx`

- [x] Props: `wineName`, `winery`, `region`, `type`, `vintage`, `quantity`, `storageLocation`, `status`, `notes`, `entryId`
- [x] Status badge: `storing` (gray) / `ready` (green) / `consumed` (muted)
- [x] Edit button → opens `AddCellarEntryModal` in edit mode
- [x] Delete button with confirmation
- [x] Match visual style of `WineCard.tsx` (inline styles, wine-red theme)

#### 10. AddCellarEntryModal component
> `client/src/app/components/AddCellarEntryModal.tsx`

- [x] Two modes: **Add** (new) and **Edit** (pre-filled)
- [x] Wine search input with autocomplete → calls `GET /api/inventory/wines/search`
- [x] Manual entry toggle — type wine name/details manually if not found in catalog
- [x] Fields: wine name, winery, type (dropdown), region, vintage (year), quantity, purchase date, storage location, status, notes
- [x] Required fields: wine name, quantity
- [x] On submit: `POST /api/inventory` (add) or `PUT /api/inventory/:id` (edit)
- [x] Modal overlay pattern matches `AddWineModal.tsx`

#### 11. EmptyCellar component
> `client/src/app/components/EmptyCellar.tsx`

- [x] Wine glass icon (like existing `EmptyWishlist.tsx`)
- [x] Message: "Your cellar is empty. Start adding wines you own."
- [x] "Add Wine" button

#### 12. API utility / fetch helper
> `client/src/app/utils/api.ts` (or inline in CellarPage)

- [x] Helper to attach Clerk auth token to fetch requests:
  ```ts
  const token = await getToken();
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  ```
- [x] Check how WishlistPage/SocialPage currently makes authenticated API calls and match that pattern

---

## File Structure When Done

```
server/src/modules/inventory/
├── builder/
│   ├── Builder.js
│   ├── CellarEntryBuilder.js
│   └── Director.js
├── wine.model.js
├── cellarEntry.model.js
├── cellar.repository.js
├── cellar.service.js
├── cellar.controller.js
└── inventory.routes.js

client/src/app/
├── pages/
│   └── CellarPage.tsx          ← replace placeholder
└── components/
    ├── CellarEntryCard.tsx      ← new
    ├── AddCellarEntryModal.tsx  ← new
    └── EmptyCellar.tsx          ← new
```

---

## Build Order (Recommended)

1. [ ] Backend models (`wine.model.js`, `cellarEntry.model.js`)
2. [ ] Builder pattern (`Builder.js`, `CellarEntryBuilder.js`, `Director.js`)
3. [ ] Repository (`cellar.repository.js`)
4. [ ] Service (`cellar.service.js`)
5. [ ] Controller (`cellar.controller.js`)
6. [ ] Routes (`inventory.routes.js`) + register in `app.js`
7. [ ] Frontend: `EmptyCellar.tsx`
8. [ ] Frontend: `CellarEntryCard.tsx`
9. [ ] Frontend: `AddCellarEntryModal.tsx`
10. [ ] Frontend: `CellarPage.tsx` (wire everything together)
