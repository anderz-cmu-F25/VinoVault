import { createBrowserRouter, Navigate, Outlet, useNavigate } from "react-router-dom";
import { ClerkProvider, useAuth, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { RootLayout } from "./layouts/RootLayout";
import { WishlistPage } from "./pages/WishlistPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { CellarPage } from "./pages/CellarPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SocialPage } from "./pages/SocialPage";
import { ChatRoomPage } from "./pages/ChatRoomPage";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

function ClerkProviderLayout() {
  const navigate = useNavigate();
  const buildClerkNavigator = (replace = false) => (
    to: string,
    metadata?: { windowNavigate?: (to: URL | string) => void }
  ) => {
    if (/^https?:\/\//.test(to)) {
      const url = new URL(to);

      if (url.origin !== window.location.origin) {
        metadata?.windowNavigate?.(url) ?? window.location.assign(url.toString());
        return;
      }

      navigate(`${url.pathname}${url.search}${url.hash}`, { replace });
      return;
    }

    navigate(to, { replace });
  };

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={buildClerkNavigator(false)}
      routerReplace={buildClerkNavigator(true)}
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/wishlist"
      signUpFallbackRedirectUrl="/wishlist"
    >
      <Outlet />
    </ClerkProvider>
  );
}

function AuthRoute({
  children,
  requireSignedIn,
}: {
  children: React.ReactNode;
  requireSignedIn: boolean;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (requireSignedIn && !isSignedIn) return <Navigate to="/login" replace />;
  if (!requireSignedIn && isSignedIn) return <Navigate to="/wishlist" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <ClerkProviderLayout />,
    children: [
      {
        path: "/login",
        element: (
          <AuthRoute requireSignedIn={false}>
            <LoginPage />
          </AuthRoute>
        )
      },
      {
        path: "/signup",
        element: (
          <AuthRoute requireSignedIn={false}>
            <SignupPage />
          </AuthRoute>
        )
      },
      {
        path: "/sso-callback",
        element: (
          <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FDF6EE' }}>
            <AuthenticateWithRedirectCallback />
            <div id="clerk-captcha" />
          </div>
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
            element: <AuthRoute requireSignedIn={true}><DiscoverPage /></AuthRoute>
          },
          {
            path: "cellar",
            element: <AuthRoute requireSignedIn={true}><CellarPage /></AuthRoute>
          },
          {
            path: "profile",
            element: <AuthRoute requireSignedIn={true}><ProfilePage /></AuthRoute>
          },
          {
            path: "social",
            element: <AuthRoute requireSignedIn={true}><SocialPage /></AuthRoute>
          },
          {
            path: "social/chat/:friendId",
            element: <AuthRoute requireSignedIn={true}><ChatRoomPage /></AuthRoute>
          }
        ]
      }
    ]
  }
]);
