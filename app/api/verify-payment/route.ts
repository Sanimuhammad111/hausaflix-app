import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reference, expectedAmount } = await req.json();

    if (!reference) {
      return NextResponse.json({ ok: false, error: "Missing reference" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: "Payment is not configured on the server." },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status) {
      return NextResponse.json(
        { ok: false, error: verifyData.message || "Could not verify payment." },
        { status: 400 }
      );
    }

    const tx = verifyData.data;

    if (tx.status !== "success") {
      return NextResponse.json(
        { ok: false, error: "Payment was not successful." },
        { status: 400 }
      );
    }

    if (typeof expectedAmount === "number" && tx.amount < expectedAmount * 100) {
      return NextResponse.json(
        { ok: false, error: "Amount paid does not match the film price." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Verification failed." },
      { status: 500 }
    );
  }
}
