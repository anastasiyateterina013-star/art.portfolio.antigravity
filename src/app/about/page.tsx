import { prisma } from "@/lib/prisma";
import Image from "next/image";
import styles from "../Home.module.css";

export default async function AboutPage() {
  const pageContent = await prisma.pageContent.findUnique({
    where: { id: "about" },
  });

  const contentText = pageContent?.content ?? "Contact information will appear here.";
  const galleryImages: string[] = JSON.parse(pageContent?.gallery || "[]");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "var(--spacing-xl) 0" }}>
      <h1 style={{ marginBottom: "var(--spacing-lg)" }}>About</h1>
      <div style={{ fontSize: "18px", lineHeight: "1.6", whiteSpace: "pre-wrap", maxWidth: "800px" }}>
        {contentText}
      </div>
    </div>
  );
}
