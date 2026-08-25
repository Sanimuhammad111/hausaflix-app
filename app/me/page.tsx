"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const [language, setLanguage] = useState("ha");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    const savedLang = localStorage.getItem("hf_language");
    const savedNotif = localStorage.getItem("hf_notifications");
    if (savedLang) setLanguage(savedLang);
    if (savedNotif) setNotifications(savedNotif === "true");

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setInfoMsg("");
    setAuthLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: formEmail,
        password: formPassword,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setInfoMsg("An yi rajista! Duba email ɗinka don tabbatarwa idan ana bukata.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: formEmail,
        password: formPassword,
      });
      if (error) {
        setAuthError(error.message);
      }
    }

    setAuthLoading(false);
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/me",
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function updateLanguage(lang: string) {
    setLanguage(lang);
    localStorage.setItem("hf_language", lang);
  }

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("hf_notifications", String(next));
  }

  if (loading) {
    return (
      <main>
        <header className="header">
          <h1>Me</h1>
        </header>
      </main>
    );
  }

  return (
    <main>
      <header className="header">
        <h1>Me</h1>
      </header>

      {!email ? (
        <div className="auth-wrap">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              className="search-input"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="search-input"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required
              minLength={6}
            />
            {authError && <p className="download-error">{authError}</p>}
            {infoMsg && <p className="auth-info">{infoMsg}</p>}
            <button type="submit" className="btn-download" disabled={authLoading}>
              {authLoading ? "Please wait..." : mode === "signin" ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>ko</span>
          </div>

          <button type="button" className="btn-google" onClick={handleGoogleSignIn}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.67 9c0-.59.1-1.17.27-1.7V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l2.99-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.99 2.34C4.66 5.16 6.65 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      ) : (
        <div className="profile-wrap">
          <div className="profile-card">
            <div className="profile-avatar">{email.charAt(0).toUpperCase()}</div>
            <div className="profile-email">{email}</div>
          </div>

          <div className="section-title">Settings</div>

          <div className="settings-row">
            <span>Language</span>
            <div className="lang-switch">
              <button
                className={`lang-btn ${language === "ha" ? "active" : ""}`}
                onClick={() => updateLanguage("ha")}
                type="button"
              >
                Hausa
              </button>
              <button
                className={`lang-btn ${language === "en" ? "active" : ""}`}
                onClick={() => updateLanguage("en")}
                type="button"
              >
                English
              </button>
            </div>
          </div>

          <div className="settings-row">
            <span>Notifications</span>
            <button
              className={`toggle ${notifications ? "on" : ""}`}
              onClick={toggleNotifications}
              type="button"
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <button className="btn-signout" onClick={handleSignOut} type="button">
            Logout
          </button>
        </div>
      )}
    </main>
  );
}
