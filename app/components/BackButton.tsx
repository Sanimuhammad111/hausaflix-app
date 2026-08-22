"use client";

export default function BackButton() {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (document.fullscreenElement) {
      e.preventDefault();
      document.exitFullscreen().finally(() => {
        window.location.href = "/";
      });
    }
  }

  return (
    <a href="/" className="back-link" onClick={handleClick}>
      ← Back
    </a>
  );
}
