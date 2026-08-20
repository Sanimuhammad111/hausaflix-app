import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HausaFlix",
  description: "Kalli fina-finan Hausa mafi kyau",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ha">
      <body>{children}</body>
    </html>
  );
}
