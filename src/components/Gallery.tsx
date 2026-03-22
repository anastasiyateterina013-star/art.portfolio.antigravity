import Link from "next/link";
import Image from "next/image";
import styles from "./Gallery.module.css";
import { prisma } from "@/lib/prisma";

export default async function Gallery({ category, title }: { category: string, title: string }) {
  const projects = await prisma.project.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.galleryPage}>
      <h1 className={styles.title}>{title}</h1>
      
      {projects.length === 0 ? (
        <p className={styles.empty}>No items found in {title.toLowerCase()}.</p>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <Link href={`/project/${project.id}`} key={project.id} className={styles.item}>
              <div className={styles.imageContainer}>
                <Image 
                  src={project.mainImage} 
                  alt={project.title} 
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className={styles.overlay}>
                <span className={styles.projectTitle}>{project.title}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
