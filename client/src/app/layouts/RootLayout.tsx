import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { NavigationBar } from "../components/NavigationBar";

export function RootLayout() {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: '#FDF6EE',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <NavigationBar />
      <Outlet />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
