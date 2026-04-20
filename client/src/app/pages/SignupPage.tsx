import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";

type PasswordStrength = "weak" | "medium" | "strong" | null;

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [continuationUsername, setContinuationUsername] = useState("");
  const [hasTriedAutoComplete, setHasTriedAutoComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, setActive, isLoaded } = useSignUp();
  const isClerkContinuation = location.hash.startsWith("#/continue");
  const missingFields = signUp?.missingFields ?? [];
  const isUsernameMissing = missingFields.includes("username");

  useEffect(() => {
    if (!isClerkContinuation || continuationUsername) return;

    const suggestedUsername =
      signUp?.username ||
      signUp?.emailAddress?.split("@")[0]?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30) ||
      "";

    if (suggestedUsername) {
      setContinuationUsername(suggestedUsername);
    }
  }, [continuationUsername, isClerkContinuation, signUp?.emailAddress, signUp?.username]);

  const completeOAuthSignUp = async (usernameOverride?: string) => {
    if (!isLoaded || !signUp) return;

    setError("");
    setIsLoading(true);

    try {
      const nextUsername = usernameOverride?.trim() ?? continuationUsername.trim();
      const result = await signUp.update({
        ...(isUsernameMissing && nextUsername ? { username: nextUsername } : {}),
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        navigate("/wishlist");
        return;
      }

      if (result.missingFields.includes("username")) {
        setError("Please choose a username to finish Google sign up.");
        return;
      }

      setError(`Google sign-up still needs: ${result.missingFields.join(", ")}`);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(
        clerkError.errors?.[0]?.message ?? "Google sign-up could not be completed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      !isClerkContinuation ||
      !isLoaded ||
      !signUp ||
      hasTriedAutoComplete ||
      !isUsernameMissing ||
      !continuationUsername.trim()
    ) {
      return;
    }

    setHasTriedAutoComplete(true);
    void completeOAuthSignUp(continuationUsername);
  }, [
    continuationUsername,
    hasTriedAutoComplete,
    isClerkContinuation,
    isLoaded,
    isUsernameMissing,
    signUp,
  ]);

  const getPasswordStrength = (pwd: string): PasswordStrength => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return "weak";
    if (pwd.length < 10) return "medium";
    return "strong";
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak": return "#DC2626";
      case "medium": return "#C9A96E";
      case "strong": return "#2E7D32";
      default: return "#E0E0E0";
    }
  };

  const getStrengthWidth = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak": return "33%";
      case "medium": return "66%";
      case "strong": return "100%";
      default: return "0%";
    }
  };

  const getStrengthLabel = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak": return "Weak";
      case "medium": return "Medium";
      case "strong": return "Strong";
      default: return "";
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        username,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/wishlist");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/wishlist",
      });
    } catch (err: unknown) {
      console.error("Google SignUp Error:", err);
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Google sign-up failed. Please try again.");
    }
  };

  if (isClerkContinuation) {
    const handleCompleteOAuthSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      await completeOAuthSignUp();
    };

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-12"
        style={{ backgroundColor: "#FDF6EE" }}
      >
        <div
          className="w-full"
          style={{
            maxWidth: "420px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h1
            className="text-center mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "32px",
              color: "#722F37",
              lineHeight: "1.2",
            }}
          >
            VinoVault
          </h1>

          <h2
            className="text-center mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              color: "#2A2A2A",
              lineHeight: "1.3",
            }}
          >
            Finish your Google sign up
          </h2>

          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              color: "#7A7A7A",
            }}
          >
            {isUsernameMissing
              ? "Using your Google account info to complete your account."
              : "We need one more step to complete your account."}
          </p>

          <form onSubmit={handleCompleteOAuthSignUp}>
            {isUsernameMissing && (
              <div className="mb-6">
                <label
                  htmlFor="continuation-username"
                  className="block mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#5A5A5A",
                  }}
                >
                  Username
                </label>
                <input
                  id="continuation-username"
                  type="text"
                  value={continuationUsername}
                  onChange={(e) => setContinuationUsername(e.target.value)}
                  className="w-full transition-all"
                  style={{
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid #D0D0D0",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "#2A2A2A",
                  }}
                />
              </div>
            )}

            {error && (
              <p
                className="mb-4 text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "#DC2626",
                }}
              >
                {error}
              </p>
            )}

            {!isUsernameMissing && missingFields.length > 0 && (
              <p
                className="mb-4 text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "#7A7A7A",
                }}
              >
                Missing fields: {missingFields.join(", ")}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || (isUsernameMissing && !continuationUsername.trim())}
              className="w-full transition-all"
              style={{
                height: "44px",
                borderRadius: "8px",
                backgroundColor: "#722F37",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor:
                  isLoading || (isUsernameMissing && !continuationUsername.trim())
                    ? "not-allowed"
                    : "pointer",
                border: "none",
                opacity:
                  isLoading || (isUsernameMissing && !continuationUsername.trim()) ? 0.7 : 1,
              }}
            >
              {isLoading ? "Completing..." : "Continue with Google"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#FDF6EE' }}
    >
      {/* Signup Card */}
      <div
        className="w-full"
        style={{ 
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Logo */}
        <h1 
          className="text-center mb-2"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            color: '#722F37',
            lineHeight: '1.2'
          }}
        >
          VinoVault
        </h1>

        {/* Heading */}
        <h2 
          className="text-center mb-1"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: '24px',
            color: '#2A2A2A',
            lineHeight: '1.3'
          }}
        >
          Create your account
        </h2>

        {/* Subtitle */}
        <p 
          className="text-center mb-8"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            color: '#7A7A7A'
          }}
        >
          Start tracking the wines you love
        </p>

        {/* Signup Form */}
        <form onSubmit={handleSignUp}>
          {/* Username Field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full transition-all"
              style={{ 
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #D0D0D0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#2A2A2A'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#722F37';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D0D0D0';
              }}
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label 
              htmlFor="email"
              className="block mb-2"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full transition-all"
              style={{ 
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #D0D0D0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#2A2A2A'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#722F37';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D0D0D0';
              }}
            />
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label 
              htmlFor="password"
              className="block mb-2"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full transition-all"
                style={{ 
                  height: '44px',
                  padding: '0 44px 0 14px',
                  borderRadius: '8px',
                  border: '1px solid #D0D0D0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#2A2A2A'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#722F37';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D0D0D0';
                }}
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex items-center justify-center transition-opacity"
                style={{ 
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: '#7A7A7A'
                }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {passwordStrength && (
            <div className="mb-4">
              <div 
                className="w-full rounded-full overflow-hidden mb-1"
                style={{ 
                  height: '4px',
                  backgroundColor: '#E0E0E0'
                }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: getStrengthWidth(passwordStrength),
                    backgroundColor: getStrengthColor(passwordStrength)
                  }}
                />
              </div>
              <p 
                style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: getStrengthColor(passwordStrength)
                }}
              >
                {getStrengthLabel(passwordStrength)}
              </p>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword"
              className="block mb-2"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full transition-all"
                style={{ 
                  height: '44px',
                  padding: '0 44px 0 14px',
                  borderRadius: '8px',
                  border: '1px solid #D0D0D0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#2A2A2A'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#722F37';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D0D0D0';
                }}
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex items-center justify-center transition-opacity"
                style={{ 
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: '#7A7A7A'
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mb-4 text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#DC2626' }}>
              {error}
            </p>
          )}

          {/* Clerk CAPTCHA widget mount point (required for bot protection) */}
          <div id="clerk-captcha" />

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mb-6 transition-all"
            style={{
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#722F37',
              color: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#5e2529';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#722F37';
            }}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              backgroundColor: '#E0E0E0'
            }}
          />
          <span 
            className="mx-4"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#9A9A9A'
            }}
          >
            or
          </span>
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              backgroundColor: '#E0E0E0'
            }}
          />
        </div>

        {/* SSO Buttons */}
        <div className="mb-8">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 transition-all"
            style={{
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #D0D0D0',
              color: '#2A2A2A',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={handleGoogleSignUp}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9F9F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign In Link */}
        <p 
          className="text-center"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#7A7A7A'
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="transition-colors"
            style={{ 
              color: '#722F37',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
