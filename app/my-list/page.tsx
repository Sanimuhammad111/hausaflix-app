"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Film = {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
};

export default function MyListPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [films, setFilms] = useState<Film[]>([]);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setLoggedIn(false);
        setLoading(false);
        return;
      }

      setLoggedIn(true);

      const { data: saved } = await supabase
        .from("saved_films")
        .select("film_id, films(id, title, category, thumbnail_url)")
        .eq("user_id", user.id);

      const result: Film[] = (saved ?? [])
        .map((row: any) => row.films)
        .filter(Boolean);

      setFilms(result);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main>
      <header className="header">
        <h1>My List</h1>
      </header>

      {loading ? null : !loggedIn ? (
        <p className="empty">Ka fara Login domin ganin jerin fina-finanka.</p>
      ) : films.length === 0 ? (
        <p className="empty">Ba ka riga ka ajiye wani fim ba tukuna.</p>
      ) : (
        <div className="grid">
          {films.map((film) => (
            <a key={film.id} href={`/watch/${film.id}`} className="card">
              <div className="thumb-wrap">
                {film.thumbnail_url ? (
                  <img src={film.thumbnail_url} alt={film.title} />
                ) : (
                  <div style={{ aspectRatio: "2/3", background: "#1a1a1a" }} />
                )}
              </div>
              <div className="title">{film.title}</div>
              {film.category && <div className="category">{film.category}</div>}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
