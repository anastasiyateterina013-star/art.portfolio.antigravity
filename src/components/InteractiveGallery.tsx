"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import styles from "../app/project/[id]/Project.module.css";

export default function InteractiveGallery({
  mainImage,
  projectTitle,
  galleryImages,
}: {
  mainImage?: string | null;
  projectTitle: string;
  galleryImages: string[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Combine mainImage and galleryImages for the lightbox array
  const allImages = [];
  if (mainImage && mainImage !== "/placeholder.jpg") {
    allImages.push(mainImage);
  }
  allImages.push(...galleryImages);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className={styles.mediaColumn}>
        {mainImage && mainImage !== "/placeholder.jpg" && (
          <div style={{ cursor: "pointer" }} onClick={() => openLightbox(0)}>
            <Image
              src={mainImage}
              alt={projectTitle}
              width={800}
              height={600}
              className={styles.mainImage}
              priority
              unoptimized={mainImage.toLowerCase().endsWith(".gif")}
            />
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className={styles.extraGallery}>
            {galleryImages.map((url, i) => {
              // The index in allImages array will be i + 1 if mainImage exists, else i
              const actualIndex = (mainImage && mainImage !== "/placeholder.jpg") ? i + 1 : i;

              return (
                <div
                  key={i}
                  className={styles.extraImageWrapper}
                  style={{ cursor: "pointer" }}
                  onClick={() => openLightbox(actualIndex)}
                >
                  <Image
                    key={i}
                    src={url}
                    alt={`Gallery ${i}`}
                    width={1200}
                    height={900}
                    className={styles.extraImage}
                    unoptimized={url.toLowerCase().endsWith(".gif")}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={allImages}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
