import { supabase } from "@/lib/supabase";

export const revalidate = 0;

type Film = {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
};

async function getFilms(): Promise<Film[]> {
  const { data, error } = await supabase
    .from("films")
    .select("id, title, category, thumbnail_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching films:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const films = await getFilms();

  return (
    <main>
      <header className="header">
        <h1>HausaFlix</h1>
      </header>

      {films.length === 0 ? (
        <p className="empty">Babu fina-finai a yanzu. Dawo baya.</p>
      ) : (
        <div className="grid">
          {films.map((film) => (
            <a key={film.id} href={`/watch/${film.id}`} className="card">
              {film.thumbnail_url ? (
                <img src={film.thumbnail_url} alt={film.title} />
              ) : (
                <div style={{ aspectRatio: "2/3", background: "#1a1a1a", borderRadius: 8 }} />
              )}
              <div className="title">{film.title}</div>
              {film.category && <div className="category">{film.category}</div>}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
