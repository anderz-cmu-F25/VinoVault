import { Outlet } from "react-router";
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
    </div>
  );
}
