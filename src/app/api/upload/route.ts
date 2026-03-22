import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" });
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: "public" });
      return NextResponse.json({ success: true, url: blob.url });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(process.cwd(), "public", "uploads", filename);
    
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (err: any) {
    console.error("Error uploading file:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
