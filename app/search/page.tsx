import { supabase } from "@/lib/supabase";
import SearchGrid from "../components/SearchGrid";

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

export default async function SearchPage() {
  const films = await getFilms();

  return (
    <main>
      <header className="header">
        <h1>Search</h1>
      </header>
      <SearchGrid films={films} />
    </main>
  );
}
