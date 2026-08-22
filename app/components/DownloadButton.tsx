"use client";

import { useState } from "react";

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

  const isFree = !price || price <= 0;
  const downloadHref = `/api/download?videoId=${encodeURIComponent(bunnyVideoId)}&title=${encodeURIComponent(title)}`;

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
        setStatus("ready");
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
      <a href={downloadHref} className="btn-download">
        ⬇ Download
      </a>
    );
  }

  if (status === "ready") {
    return (
      <a href={downloadHref} className="btn-download">
        ⬇ Download Now
      </a>
    );
  }

  return (
    <>
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
