import { supabase } from "@/lib/supabase";
import SearchGrid from "./components/SearchGrid";

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
  const featured = films[0];

  return (
    <main>
      <header className="header">
        <div>
          <h1>HausaFlix</h1>
          <div className="tagline">Watch the best Hausa movies</div>
        </div>
      </header>

      {films.length === 0 ? (
        <p className="empty">No movies available yet. Please check back later.</p>
      ) : (
        <>
          {featured && (
            <section className="hero">
              {featured.thumbnail_url && (
                <img src={featured.thumbnail_url} alt={featured.title} />
              )}
              <div className="hero-content">
                <span className="hero-badge">New Release</span>
                <h2 className="hero-title">{featured.title}</h2>
                {featured.category && (
                  <div className="hero-meta">{featured.category}</div>
                )}
                <div className="hero-actions">
                  <a href={`/watch/${featured.id}`} className="btn-play">
                    Watch Now
                  </a>
                </div>
              </div>
            </section>
          )}

          <SearchGrid films={films} />
        </>
      )}
    </main>
  );
                }
