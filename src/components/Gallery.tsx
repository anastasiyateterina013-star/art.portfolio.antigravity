import Link from "next/link";
import Image from "next/image";
import styles from "./Gallery.module.css";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function Gallery({ category, title }: { category: string, title: string }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const projects = await prisma.project.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.galleryPage}>
      <h1 className={styles.title}>{title}</h1>
      
      {projects.length === 0 ? (
        <p className={styles.empty}>{lang === "et" ? "Selles kategoorias objekte ei leitud." : `No items found in ${title.toLowerCase()}.`}</p>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => {
            const displayTitle = lang === "et" && project.title_et ? project.title_et : project.title;
            return (
            <Link href={`/project/${project.id}`} key={project.id} className={styles.item}>
              {project.mainImage && project.mainImage !== "/placeholder.jpg" && (
                <Image 
                  src={project.mainImage} 
                  alt={project.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.image}
                  unoptimized={project.mainImage.toLowerCase().endsWith('.gif')}
                />
              )}<div className={styles.overlay}>
                <span className={styles.projectTitle}>{displayTitle}</span>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
