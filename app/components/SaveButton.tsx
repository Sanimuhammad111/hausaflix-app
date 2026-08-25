"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SaveButton({ filmId }: { filmId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: existing } = await supabase
          .from("saved_films")
          .select("id")
          .eq("user_id", uid)
          .eq("film_id", filmId)
          .maybeSingle();

        setSaved(!!existing);
      }

      setLoading(false);
    });
  }, [filmId]);

  async function toggleSave() {
    if (!userId) {
      window.location.href = "/me";
      return;
    }

    if (saved) {
      await supabase
        .from("saved_films")
        .delete()
        .eq("user_id", userId)
        .eq("film_id", filmId);
      setSaved(false);
    } else {
      await supabase
        .from("saved_films")
        .insert({ user_id: userId, film_id: filmId });
      setSaved(true);
    }
  }

  if (loading) return null;

  return (
    <button className={`btn-save ${saved ? "saved" : ""}`} onClick={toggleSave} type="button">
      {saved ? "✓ Saved to My List" : "+ Add to My List"}
    </button>
  );
}
