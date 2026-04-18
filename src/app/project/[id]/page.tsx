import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./Project.module.css";
import { Metadata } from "next";
import { cookies } from "next/headers";
import RichText from "@/components/RichText";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
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

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const displayTitle = lang === "et" && project.title_et ? project.title_et : project.title;
  const displayDesc = lang === "et" && project.description_et ? project.description_et : project.description;
  const displayContent = lang === "et" && project.content_et ? project.content_et : project.content;
  
  const t = {
    back: lang === "et" ? "Tagasi" : "Back to",
    design: lang === "et" ? "Disainitööde juurde" : "Design Works",
    paintings: lang === "et" ? "Maalide juurde" : "Paintings"
  };

  if (!project) {
    notFound();
  }

  const galleryImages: string[] = JSON.parse(project.gallery || "[]");

  return (
    <article className={styles.projectPage}>
      <div className={styles.navigation}>
        <Link href={`/${project.category === "design" ? "design" : "maal"}`} className={styles.backLink}>
          ← {t.back} {project.category === "design" ? t.design : t.paintings}
        </Link>
      </div>

      <div className={styles.content}>
        
        <div className={styles.detailsColumn}>
          <h1 className={styles.title}>{displayTitle}</h1>
          {displayDesc && <p className={styles.description}>{displayDesc}</p>}
          
          {displayContent && (
            <div className={styles.longContent}>
              <RichText content={displayContent} />
            </div>
          )}
        </div>

        <div className={styles.mediaColumn}>
          {project.mainImage && project.mainImage !== "/placeholder.jpg" && (
            <Image
              src={project.mainImage}
              alt={project.title}
              width={800}
              height={600}
              className={styles.mainImage}
              priority
              unoptimized={project.mainImage.toLowerCase().endsWith('.gif')}
            />
          )}
          
          {galleryImages.length > 0 && (
            <div className={styles.extraGallery}>
            {galleryImages.map((url, i) => (
              <div key={i} className={styles.extraImageWrapper}>
                <Image key={i} src={url} alt={`Gallery ${i}`} width={1200} height={900} className={styles.extraImage} unoptimized={url.toLowerCase().endsWith('.gif')} />
              </div>
            ))}
          </div>)}
        </div>
      </div>
    </article>
  );
}
