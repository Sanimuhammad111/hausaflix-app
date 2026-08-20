"use client";

import { useMemo, useState } from "react";

type Film = {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
};

export default function SearchGrid({ films }: { films: Film[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return films;
    return films.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        (f.category ?? "").toLowerCase().includes(q)
    );
  }, [films, query]);

  return (
    <>
      <div className="search-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nemo fim ko category..."
          className="search-input"
        />
      </div>

      <div className="section-title">
        {query ? `Sakamakon "${query}"` : "Duk Fina-finai"}
      </div>

      {filtered.length === 0 ? (
        <p className="empty">Babu fim da ya dace da neman ka.</p>
      ) : (
        <div className="grid">
          {filtered.map((film) => (
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
    </>
  );
}
