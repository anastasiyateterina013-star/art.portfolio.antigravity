"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Gallery.module.css";
import type { Project } from "@prisma/client";

export default function GalleryGrid({
  projects,
  lang,
}: {
  projects: Project[];
  lang: string;
}) {
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div className={styles.grid}>
        {projects.map((project) => {
          const displayTitle =
            lang === "et" && project.title_et ? project.title_et : project.title;
          const slug = encodeURIComponent(displayTitle.toUpperCase().replace(/\s+/g, ""));
          return (
            <Link
              href={`/project/${slug}`}
              key={project.id}
              className={styles.item}
              onMouseEnter={() => setHoveredProject(displayTitle)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {project.mainImage && project.mainImage !== "/placeholder.jpg" && (
                <Image
                  src={project.mainImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.image}
                  unoptimized={project.mainImage.toLowerCase().endsWith(".gif")}
                />
              )}
            </Link>
          );
        })}
      </div>

      {hoveredProject && (
        <div
          className={styles.customCursor}
          style={{
            transform: `translate(${cursorPos.x + 15}px, ${cursorPos.y + 15}px)`,
          }}
        >
          {hoveredProject}
        </div>
      )}
    </>
  );
}
