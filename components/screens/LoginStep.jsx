"use client";
import { useEffect, useState, useRef } from "react";

export default function LoginStep({ speak, onDone }) {
  const [mode, setMode] = useState("signin"); // "signin" | "guest"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const emailInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      await speak(
        "Welcome to your MindSense sanctuary.",
        "Sign in to your account or continue as guest to begin your private assessment.",
        { pitch: 1.04 }
      );
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    })();
  }, []);

  const handleSignIn = (e) => {
    e?.preventDefault();
    if (mode === "signin" && !email.trim()) {
      setError("Please enter your email or patient ID");
      return;
    }
    setError("");
    const user = {
      isGuest: mode === "guest",
      email: mode === "guest" ? "Guest Patient" : email.trim(),
      authTime: new Date().toISOString(),
    };
    onDone(user);
  };

  const handleSocialLogin = (provider) => {
    const user = {
      isGuest: false,
      provider,
      email: `user.${provider.toLowerCase()}@mindsense.health`,
      authTime: new Date().toISOString(),
    };
    onDone(user);
  };

  return (
    <div className="controls login-card">
      <div className="auth-tabs" role="tablist">
        <button
          className={`tab-btn ${mode === "signin" ? "active" : ""}`}
          onClick={() => { setMode("signin"); setError(""); }}
          role="tab"
          aria-selected={mode === "signin"}
        >
          Patient Sign In
        </button>
        <button
          className={`tab-btn ${mode === "guest" ? "active" : ""}`}
          onClick={() => { setMode("guest"); setError(""); }}
          role="tab"
          aria-selected={mode === "guest"}
        >
          Quick Guest Access
        </button>
      </div>

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="auth-form">
          <div className="input-group">
            <label htmlFor="patient-email">Email or Patient ID</label>
            <input
              id="patient-email"
              ref={emailInputRef}
              className="name auth-input"
              type="text"
              placeholder="e.g. alex@mindsense.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="patient-pass">Passcode / PIN</label>
            <input
              id="patient-pass"
              className="name auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="row" style={{ marginTop: 6 }}>
            <button type="submit" className="btn primary" style={{ width: "100%" }}>
              Sign In &amp; Continue
            </button>
          </div>

          <div className="divider">
            <span>or sign in with</span>
          </div>

          <div className="social-login-grid">
            <button
              type="button"
              className="btn ghost social-btn"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="btn ghost social-btn"
              onClick={() => handleSocialLogin("Apple")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.12-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-1.01 3 .01 0 .04 0 .07 0 1.09 0 2.2-.62 2.8-1.36z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="auth-form guest-box">
          <div className="guest-info">
            <div className="shield-icon">🛡️</div>
            <p><strong>Private &amp; Anonymous</strong></p>
            <p className="guest-sub">
              No registration needed. Your assessment session is encrypted, processed locally, and discarded when you close the tab.
            </p>
          </div>
          <button className="btn primary" onClick={handleSignIn} style={{ width: "100%" }}>
            Start Private Guest Session
          </button>
        </div>
      )}
    </div>
  );
}
