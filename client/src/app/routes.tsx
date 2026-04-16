import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { WishlistPage } from "./pages/WishlistPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { CellarPage } from "./pages/CellarPage";
import { ProfilePage } from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/wishlist" replace />
      },
      {
        path: "wishlist",
        element: <WishlistPage />
      },
      {
        path: "discover",
        element: <DiscoverPage />
      },
      {
        path: "cellar",
        element: <CellarPage />
      },
      {
        path: "profile",
        element: <ProfilePage />
      }
    ]
  }
]);
