"use client";

export default function FullscreenButton() {
  async function goFullscreen() {
    const el = document.getElementById("player-frame");
    if (!el) return;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }

      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock("landscape");
        } catch (e) {
          // some browsers block this outside PWA context — safe to ignore
        }
      }
    } catch (e) {
      // fullscreen not supported — ignore
    }
  }

  return (
    <button className="btn-fullscreen" onClick={goFullscreen} type="button">
      ⛶ Fullscreen
    </button>
  );
}
