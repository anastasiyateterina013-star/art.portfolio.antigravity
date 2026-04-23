import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./Project.module.css";
import { Metadata } from "next";
import { cookies } from "next/headers";
import RichText from "@/components/RichText";
import InteractiveGallery from "@/components/InteractiveGallery";

type Props = {
  params: Promise<{ id: string }>
}

async function getProjectByParam(paramId: string) {
  const decoded = decodeURIComponent(paramId);
  const searchStr = decoded.toUpperCase().replace(/\s+/g, '');
  
  // 1. Try to find by UUID first (in case old links are used)
  let project = await prisma.project.findUnique({ where: { id: decoded } }).catch(() => null);
  
  // 2. Fallback to slug matching against English or Estonian title
  if (!project) {
    const allProjects = await prisma.project.findMany();
    project = allProjects.find(p => {
      const matchEn = p.title.toUpperCase().replace(/\s+/g, '') === searchStr;
      const matchEt = p.title_et ? p.title_et.toUpperCase().replace(/\s+/g, '') === searchStr : false;
      return matchEn || matchEt;
    }) || null;
  }
  return project;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getProjectByParam(resolvedParams.id);
  
  if (!project) return { title: "Project Not Found" };
  return { title: `${project.title} | Anastasiya Teterina` };
}

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const project = await getProjectByParam(resolvedParams.id);

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

        <InteractiveGallery
          mainImage={project.mainImage}
          projectTitle={project.title}
          galleryImages={galleryImages}
        />
      </div>
    </article>
  );
}
