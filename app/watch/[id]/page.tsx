import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 0;

type Film = {
  id: string;
  title: string;
  category: string | null;
  bunny_video_id: string;
};

async function getFilm(id: string): Promise<Film | null> {
  const { data, error } = await supabase
    .from("films")
    .select("id, title, category, bunny_video_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function WatchPage({
  params,
}: {
  params: { id: string };
}) {
  const film = await getFilm(params.id);

  if (!film) {
    notFound();
  }

  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${film.bunny_video_id}?autoplay=true`;

  return (
    <main className="player-wrap">
      <a href="/" className="back-link">
        ← Back
      </a>
      <div className="player-frame">
        <iframe
          src={embedUrl}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      </div>
      <div className="watch-title">{film.title}</div>
      {film.category && <div className="watch-category">{film.category}</div>}
    </main>
  );
}
