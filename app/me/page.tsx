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
              Sign In
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
              {authLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>
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
            Sign Out
          </button>
        </div>
      )}
    </main>
  );
}
