"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function DownloadButton({
  filmId,
  title,
  price,
  bunnyVideoId,
}: {
  filmId: string;
  title: string;
  price: number;
  bunnyVideoId: string;
}) {
  const [email, setEmail] = useState("");
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const isFree = !price || price <= 0;

  async function resolveDownloadUrl(): Promise<string | null> {
    try {
      const res = await fetch(`/api/download-url?videoId=${encodeURIComponent(bunnyVideoId)}`);
      const data = await res.json();
      if (data.ok) return data.url;
      setErrorMsg(data.error || "Could not find a downloadable file for this video.");
      return null;
    } catch {
      setErrorMsg("Could not reach the download service.");
      return null;
    }
  }

  async function handleFreeDownload() {
    setStatus("verifying");
    const url = await resolveDownloadUrl();
    if (url) {
      setDownloadUrl(url);
      setStatus("ready");
      window.location.href = url;
    } else {
      setStatus("error");
    }
  }

  function startPayment() {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || !window.PaystackPop) {
      setErrorMsg("Payment system is not ready. Please try again in a moment.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(price * 100),
      currency: "NGN",
      ref: `hf_${filmId}_${Date.now()}`,
      metadata: { film_id: filmId, film_title: title },
      callback: function (response: any) {
        verifyAndUnlock(response.reference);
      },
      onClose: function () {},
    });
    handler.openIframe();
  }

  async function verifyAndUnlock(reference: string) {
    setStatus("verifying");
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, expectedAmount: price }),
      });
      const data = await res.json();
      if (data.ok) {
        const url = await resolveDownloadUrl();
        if (url) {
          setDownloadUrl(url);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Payment could not be verified.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong while verifying payment.");
    }
  }

  if (isFree) {
    return (
      <div className="download-box">
        <button className="btn-download" onClick={handleFreeDownload} disabled={status === "verifying"}>
          {status === "verifying" ? "Preparing..." : "⬇ Download"}
        </button>
        {errorMsg && <div className="download-error">{errorMsg}</div>}
      </div>
    );
  }

  if (status === "ready") {
    return (
      <a href={downloadUrl} className="btn-download" download>
        ⬇ Download Now
      </a>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      {!showEmailBox ? (
        <button className="btn-download" onClick={() => setShowEmailBox(true)}>
          ⬇ Download — ₦{price}
        </button>
      ) : (
        <div className="download-box">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="download-email-input"
          />
          <button
            className="btn-download"
            onClick={startPayment}
            disabled={status === "verifying"}
          >
            {status === "verifying" ? "Verifying..." : `Pay ₦${price} to Download`}
          </button>
          {errorMsg && <div className="download-error">{errorMsg}</div>}
        </div>
      )}
    </>
  );
}
