
import styles from "./Gallery.module.css";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import GalleryGrid from "./GalleryGrid";

export default async function Gallery({ category, title }: { category: string, title: string }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const projects = await prisma.project.findMany({
    where: { category },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className={styles.galleryPage}>
      <h1 className={styles.title}>{title}</h1>
      
      {projects.length === 0 ? (
        <p className={styles.empty}>{lang === "et" ? "Selles kategoorias objekte ei leitud." : `No items found in ${title.toLowerCase()}.`}</p>
      ) : (
        <GalleryGrid projects={projects} lang={lang} />
      )}
    </div>
  );
}
