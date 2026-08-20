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
  const featured = films[0];
  const rest = films.slice(1);

  return (
    <main>
      <header className="header">
        <div>
          <h1>HausaFlix</h1>
          <div className="tagline">Kalli fina-finan Hausa</div>
        </div>
      </header>

      {films.length === 0 ? (
        <p className="empty">Babu fina-finai a yanzu. Dawo baya.</p>
      ) : (
        <>
          {featured && (
            <section className="hero">
              {featured.thumbnail_url && (
                <img src={featured.thumbnail_url} alt={featured.title} />
              )}
              <div className="hero-content">
                <span className="hero-badge">Sabon Fim</span>
                <h2 className="hero-title">{featured.title}</h2>
                {featured.category && (
                  <div className="hero-meta">{featured.category}</div>
                )}
                <div className="hero-actions">
                  <a href={`/watch/${featured.id}`} className="btn-play">
                    Kalli Yanzu
                  </a>
                </div>
              </div>
            </section>
          )}

          <div className="section-title">Duk Fina-finai</div>
          <div className="grid">
            {(featured ? rest : films).map((film) => (
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
        </>
      )}
    </main>
  );
}
