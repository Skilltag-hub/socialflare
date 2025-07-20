import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Prepare form data for ImageKit
  const ikForm = new FormData();
  ikForm.append("file", file); // file is already a Blob
  ikForm.append("fileName", (file as File).name);

  try {
    const res = await fetch("https://upload.imagekit.io/api/v2/files/upload", {
      method: "POST",
      headers: {
        Authorization: "Basic cHVibGljX3FvaU1XZ3BzaWp2S2dGRjB1TEJCL0ZmYU15dz0",
        // Do not set Content-Type, let fetch handle it
      },
      body: ikForm,
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
