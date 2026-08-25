"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SiteLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("logo_url")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.logo_url) setLogoUrl(data.logo_url);
      });
  }, []);

  if (logoUrl) {
    return <img src={logoUrl} alt="HausaFlix" className="site-logo" />;
  }

  return <h1>HausaFlix</h1>;
}
