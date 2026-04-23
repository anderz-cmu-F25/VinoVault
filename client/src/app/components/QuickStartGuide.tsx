import { Bell, BookOpenCheck, Boxes, Compass, Heart, HelpCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const GUIDE_STORAGE_KEY = "vinovault.quickStartGuide.seen";

interface QuickStartGuideProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const steps = [
  {
    icon: Compass,
    title: "Discover wines",
    description: "Search and browse wines first when you are deciding what to track, buy, or review.",
  },
  {
    icon: Heart,
    title: "Watch prices",
    description: "Add a wine to your wishlist with a target price so VinoVault can surface price drops.",
  },
  {
    icon: Boxes,
    title: "Manage your cellar",
    description: "Move bottles you own into Cellar to record quantity, storage location, status, and notes.",
  },
  {
    icon: Star,
    title: "Review and remember",
    description: "Leave reviews after tasting so your future buying decisions are easier to make.",
  },
];

function markGuideSeen() {
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEY, "true");
  } catch {
    // The guide should still work when localStorage is unavailable.
  }
}

export function QuickStartGuide({ isOpen, onOpenChange }: QuickStartGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const activeStep = steps[currentStep];
  const ActiveIcon = activeStep.icon;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    try {
      const hasSeenGuide = window.localStorage.getItem(GUIDE_STORAGE_KEY) === "true";
      if (!hasSeenGuide) {
        onOpenChange(true);
      }
    } catch {
      onOpenChange(true);
    }
  }, [onOpenChange]);

  const closeGuide = () => {
    markGuideSeen();
    onOpenChange(false);
  };

  const startWithWishlist = () => {
    markGuideSeen();
    onOpenChange(false);
    navigate("/wishlist");
  };

  const startWithDiscover = () => {
    markGuideSeen();
    onOpenChange(false);
    navigate("/discover");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeGuide();
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-xl" style={{ backgroundColor: "#FFFDF9", borderColor: "#E8DDD2" }}>
        <DialogHeader className="pr-8">
          <div
            className="mb-2 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F4E7DC", color: "#722F37" }}
          >
            <HelpCircle className="h-5 w-5" />
          </div>
          <DialogTitle
            className="text-2xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "#722F37" }}
          >
            Quick start for VinoVault
          </DialogTitle>
          <DialogDescription
            className="text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#6F6A64", lineHeight: 1.6 }}
          >
            Learn the main flow in under a minute. You can reopen this guide from the Help button.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div
            className="rounded-lg border p-5"
            style={{ backgroundColor: "#FDF6EE", borderColor: "#E8DDD2" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: "#722F37", color: "#FFFFFF" }}
              >
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <p
                  className="text-xs uppercase"
                  style={{ color: "#9A7D68", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}
                >
                  Step {currentStep + 1} of {steps.length}
                </p>
                <h3
                  className="text-lg"
                  style={{ color: "#2F2A27", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}
                >
                  {activeStep.title}
                </h3>
              </div>
            </div>
            <p
              className="text-sm"
              style={{ color: "#6F6A64", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}
            >
              {activeStep.description}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className="flex min-h-16 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor: isActive ? "#F4E7DC" : "#FFFFFF",
                    borderColor: isActive ? "#722F37" : "#E8DDD2",
                    color: isActive ? "#722F37" : "#6F6A64",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                  }}
                  aria-label={`Show ${step.title}`}
                >
                  <StepIcon className="h-4 w-4 shrink-0" />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          <div
            className="flex items-start gap-3 rounded-lg px-4 py-3"
            style={{ backgroundColor: "#F8F1E8", color: "#6F6A64" }}
          >
            <Bell className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#722F37" }} />
            <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              Tip: Wishlist is for wines you want to buy later; Cellar is for bottles you already own.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <button
            type="button"
            onClick={closeGuide}
            className="rounded-md px-4 py-2 text-sm transition-colors"
            style={{
              color: "#6F6A64",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isLastStep ? (
              <>
                <button
                  type="button"
                  onClick={startWithDiscover}
                  className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors"
                  style={{
                    borderColor: "#722F37",
                    color: "#722F37",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <BookOpenCheck className="h-4 w-4" />
                  Explore wines
                </button>
                <button
                  type="button"
                  onClick={startWithWishlist}
                  className="rounded-md px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: "#722F37",
                    color: "#FFFFFF",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Start wishlist
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep((step) => step + 1)}
                className="rounded-md px-4 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: "#722F37",
                  color: "#FFFFFF",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Next
              </button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
