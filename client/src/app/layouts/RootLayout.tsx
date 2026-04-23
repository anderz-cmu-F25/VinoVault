import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { useCallback, useState } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { QuickStartGuide } from "../components/QuickStartGuide";

export function RootLayout() {
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const openQuickStart = useCallback(() => setIsQuickStartOpen(true), []);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#FDF6EE',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <NavigationBar onOpenGuide={openQuickStart} />
      <Outlet />
      <QuickStartGuide isOpen={isQuickStartOpen} onOpenChange={setIsQuickStartOpen} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
