import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Use Node instead of Edge

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string" || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: "Invalid or missing file" },
      { status: 400 }
    );
  }

  const ikForm = new FormData();
  ikForm.append("file", file);
  ikForm.append("fileName", (file as File).name || "uploaded-file");

  try {
    const res = await fetch("https://upload.imagekit.io/api/v2/files/upload", {
      method: "POST",
      headers: {
        Authorization: "Basic cHVibGljX3FvaU1XZ3BzaWp2S2dGRjB1TEJCL0ZmYU15dz0",
      },
      body: ikForm,
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data = JSON.parse(text);
    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
