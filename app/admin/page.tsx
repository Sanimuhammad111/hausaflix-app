"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = [
  "Muhammed34325@gmail.com",
  "Muhammadsani6846@gmail.com",
];

type Film = {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
  bunny_video_id: string;
  price: number | null;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const [films, setFilms] = useState<Film[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [bunnyVideoId, setBunnyVideoId] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoMessage, setLogoMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const userEmail = data.user?.email ?? null;
      setEmail(userEmail);
      setIsAdmin(
        !!userEmail &&
          ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(userEmail.toLowerCase())
      );
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadFilms();
      loadLogo();
    }
  }, [isAdmin]);

  async function loadFilms() {
    const { data } = await supabase
      .from("films")
      .select("id, title, category, thumbnail_url, bunny_video_id, price")
      .order("created_at", { ascending: false });
    setFilms(data ?? []);
  }

  async function loadLogo() {
    const { data } = await supabase
      .from("app_settings")
      .select("logo_url")
      .eq("id", 1)
      .single();
    setLogoUrl(data?.logo_url ?? "");
  }

  async function handleLogoSave(e: React.FormEvent) {
    e.preventDefault();
    setLogoSaving(true);
    setLogoMessage("");

    const { error } = await supabase
      .from("app_settings")
      .update({ logo_url: logoUrl || null })
      .eq("id", 1);

    if (error) setLogoMessage(error.message);
    else setLogoMessage("An sabunta logo!");

    setLogoSaving(false);
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCategory("");
    setThumbnailUrl("");
    setBunnyVideoId("");
    setPrice("");
  }

  function startEdit(film: Film) {
    setEditingId(film.id);
    setTitle(film.title);
    setCategory(film.category ?? "");
    setThumbnailUrl(film.thumbnail_url ?? "");
    setBunnyVideoId(film.bunny_video_id ?? "");
    setPrice(film.price ? String(film.price) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title,
      category: category || null,
      thumbnail_url: thumbnailUrl || null,
      bunny_video_id: bunnyVideoId,
      price: price ? Number(price) : null,
    };

    if (editingId) {
      const { error } = await supabase.from("films").update(payload).eq("id", editingId);
      if (error) setMessage(error.message);
      else setMessage("An sabunta fim ɗin!");
    } else {
      const { error } = await supabase.from("films").insert(payload);
      if (error) setMessage(error.message);
      else setMessage("An ƙara sabon fim!");
    }

    setSaving(false);
    resetForm();
    loadFilms();
  }

  async function handleDelete(id: string) {
    if (!confirm("Tabbata kana son share wannan fim?")) return;
    await supabase.from("films").delete().eq("id", id);
    loadFilms();
  }

  if (loading) {
    return (
      <main>
        <header className="header">
          <h1>Admin</h1>
        </header>
      </main>
    );
  }

  if (!email) {
    return (
      <main>
        <header className="header">
          <h1>Admin</h1>
        </header>
        <p className="empty">Ka fara Login domin isa wannan shafi.</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main>
        <header className="header">
          <h1>Admin</h1>
        </header>
        <p className="empty">Ba ka da izinin shiga wannan shafi.</p>
      </main>
    );
  }

  return (
    <main>
      <header className="header">
        <h1>Admin Dashboard</h1>
      </header>

      <div className="admin-wrap">
        <form className="admin-form" onSubmit={handleLogoSave}>
          <div className="section-title" style={{ padding: 0, marginBottom: 4 }}>
            App Logo
          </div>
          {logoUrl && (
            <img src={logoUrl} alt="Current logo" style={{ height: 40, marginBottom: 6 }} />
          )}
          <input
            type="text"
            placeholder="Logo Image URL"
            className="search-input"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          {logoMessage && <p className="auth-info">{logoMessage}</p>}
          <button type="submit" className="btn-download" disabled={logoSaving}>
            {logoSaving ? "Ana ajiyewa..." : "Sabunta Logo"}
          </button>
        </form>

        <div className="admin-divider" />

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="section-title" style={{ padding: 0, marginBottom: 4 }}>
            {editingId ? "Gyara Fim" : "Ƙara Sabon Fim"}
          </div>

          <input
            type="text"
            placeholder="Title"
            className="search-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category (Action, Romance, Drama, Series)"
            className="search-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="text"
            placeholder="Thumbnail URL"
            className="search-input"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bunny Video ID"
            className="search-input"
            value={bunnyVideoId}
            onChange={(e) => setBunnyVideoId(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price (leave empty if free)"
            className="search-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          {message && <p className="auth-info">{message}</p>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn-download" disabled={saving}>
              {saving ? "Ana ajiyewa..." : editingId ? "Sabunta" : "Ƙara Fim"}
            </button>
            {editingId && (
              <button type="button" className="btn-save" onClick={resetForm}>
                Soke
              </button>
            )}
          </div>
        </form>

        <div className="section-title" style={{ padding: "24px 0 8px" }}>
          Dukkan Fina-finai ({films.length})
        </div>

        <div className="admin-list">
          {films.map((film) => (
            <div key={film.id} className="admin-row">
              <div className="admin-row-info">
                <div className="title">{film.title}</div>
                {film.category && <div className="category">{film.category}</div>}
              </div>
              <div className="admin-row-actions">
                <button className="btn-save" onClick={() => startEdit(film)} type="button">
                  Gyara
                </button>
                <button className="btn-signout" onClick={() => handleDelete(film.id)} type="button">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
                                 }
