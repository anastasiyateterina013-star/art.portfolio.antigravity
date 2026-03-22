import styles from "./Home.module.css";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function Home() {
  const pageContent = await prisma.pageContent.findUnique({
    where: { id: "home" },
  });

  const contentText = pageContent?.content ?? "I'm a graphic designer and a student of EKA, Tallinn.\nI'm passionate about creating relevant and useful design products.";
  const profileImage = pageContent?.mainImage;
  const galleryImages: string[] = JSON.parse(pageContent?.gallery || "[]");

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.twoColumnGrid}>
          
          <div className={styles.contentSection}>
            <h1 className={styles.name}>Anastasiya Teterina</h1>

            {contentText && (
              <div className={styles.introText}>
                {contentText.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
            
            <div className={styles.skills}>
              <h2>Software I work with:</h2>
              <div className={styles.skillTags}>
                <span>Figma</span>
                <span>Photoshop</span>
                <span>Illustrator</span>
                <span>InDesign</span>
                <span>Premiere Pro</span>
              </div>
              
              <h2 style={{ marginTop: "var(--spacing-md)" }}>What else I do:</h2>
              <p style={{ fontSize: "18px" }}>Photography, video editing, social media management</p>
              
              <div className={styles.socials}>
                 <a href="#">Telegram</a>
                 <a href="#">Instagram</a>
                 <a href="#">Facebook</a>
              </div>
            </div>
          </div>

          {profileImage && profileImage !== "/placeholder.jpg" && (
             <div className={styles.portraitColumn}>
               <div className={styles.portraitWrapper}>
                 <Image src={profileImage} alt="Anastasiya Teterina" width={400} height={500} className={styles.portraitImage} priority />
               </div>
             </div>
          )}

        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className={styles.extraGallery}>
          {galleryImages.map((url, i) => (
            <Image key={i} src={url} alt={`Home Gallery ${i}`} width={500} height={500} className={styles.extraImage} />
          ))}
        </div>
      )}
      
      <footer className={styles.footer}>
        <p className={styles.copyright}>© 2026 All rights reserved. Anastasiya Teterina.</p>
      </footer>
    </div>
  );
}
