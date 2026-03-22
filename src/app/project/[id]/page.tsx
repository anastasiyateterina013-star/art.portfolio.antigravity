import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./Project.module.css";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({ where: { id: resolvedParams.id } });
  
  if (!project) return { title: "Project Not Found" };
  return { title: `${project.title} | Anastasiya Teterina` };
}

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!project) {
    notFound();
  }

  const galleryImages: string[] = JSON.parse(project.gallery || "[]");

  return (
    <article className={styles.projectPage}>
      <div className={styles.navigation}>
        <Link href={`/${project.category === "design" ? "design" : "maal"}`} className={styles.backLink}>
          ← Back to {project.category === "design" ? "Design Works" : "Paintings"}
        </Link>
      </div>

      <div className={styles.content}>
        
        <div className={styles.detailsColumn}>
          <h1 className={styles.title}>{project.title}</h1>
          {project.description && <p className={styles.description}>{project.description}</p>}
          
          {project.content && (
            <div className={styles.longContent}>
              {project.content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className={styles.mediaColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src={project.mainImage}
              alt={project.title}
              width={1600}
              height={1200}
              className={styles.image}
              priority
            />
          </div>
          
          {galleryImages.length > 0 && (
            <div className={styles.extraGallery}>
              {galleryImages.map((url, i) => (
                <Image key={i} src={url} alt={`Gallery ${i}`} width={1200} height={900} className={styles.extraImage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
