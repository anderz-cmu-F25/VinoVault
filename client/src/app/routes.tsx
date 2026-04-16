import { createBrowserRouter, Navigate } from "react-router";
import { useAuth, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { RootLayout } from "./layouts/RootLayout";
import { WishlistPage } from "./pages/WishlistPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { CellarPage } from "./pages/CellarPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/sso-callback",
    element: (
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/wishlist"
        signUpForceRedirectUrl="/wishlist"
      />
    )
  },
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
        element: <ProtectedRoute><DiscoverPage /></ProtectedRoute>
      },
      {
        path: "cellar",
        element: <ProtectedRoute><CellarPage /></ProtectedRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      }
    ]
  }
]);
