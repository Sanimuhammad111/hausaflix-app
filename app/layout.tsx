import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HausaFlix",
  description: "Watch the best Hausa movies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
