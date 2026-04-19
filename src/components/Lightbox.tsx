"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Lightbox.module.css";

export default function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, onClose]);

  const prevImage = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  const currentImage = images[index];

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

      <div className={styles.imageContainer} onClick={(e) => e.stopPropagation()}>
        <Image
          src={currentImage}
          alt={`Fullscreen image ${index + 1}`}
          fill
          unoptimized={currentImage.toLowerCase().endsWith(".gif")}
          className={styles.image}
        />
        
        {images.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage}>
              ‹
            </button>
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage}>
              ›
            </button>
            <div className={styles.counter}>
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
