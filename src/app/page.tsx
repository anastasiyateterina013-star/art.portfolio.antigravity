import styles from "./Home.module.css";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { cookies } from "next/headers";
import RichText from "@/components/RichText";
import LightboxWrapper from "@/components/LightboxWrapper";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  let pageContent = await prisma.pageContent.findUnique({
    where: { id: lang === "et" ? "home_et" : "home" },
  });
  if (!pageContent && lang === "et") {
    pageContent = await prisma.pageContent.findUnique({ where: { id: "home" } });
  }

  const t = {
    copyright: lang === "et" ? "Kõik õigused kaitstud." : "All rights reserved."
  };

  const defaultContent = "I'm a graphic designer and a student of EKA, Tallinn.\nI'm passionate about creating relevant and useful design products.\n\n### Software I work with:\nIllustrator; InDesign; Figma; Photoshop\n\n### What else I do:\nPhotography, video editing, social media management";
  const contentText = pageContent?.content ?? defaultContent;
  const profileImage = pageContent?.mainImage;
  const galleryImages: string[] = JSON.parse(pageContent?.gallery || "[]");

  let heroText = contentText;
  let restContent = "";
  const splitIndex = contentText.indexOf('\n\n');
  if (splitIndex !== -1) {
    heroText = contentText.substring(0, splitIndex).trim();
    restContent = contentText.substring(splitIndex).trim();
  }

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.twoColumnGrid}>
          
          <div className={styles.contentSection}>
            <h1 className={styles.name}>Anastasiya Teterina</h1>

            {heroText && (
              <div className={styles.introText}>
                {heroText.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
            
            {restContent && (
              <div style={{ paddingTop: "var(--spacing-sm)" }}>
                <RichText content={restContent} />
              </div>
            )}
          </div>

          {profileImage && profileImage !== "/placeholder.jpg" && (
             <div className={styles.portraitColumn}>
               <div className={styles.portraitWrapper}>
                 <LightboxWrapper images={[profileImage, ...galleryImages]} index={0}>
                   <Image src={profileImage} alt="Anastasiya Teterina" width={400} height={500} className={styles.portraitImage} priority unoptimized={profileImage.toLowerCase().endsWith('.gif')} />
                 </LightboxWrapper>
               </div>
             </div>
          )}

        </div>
      </div>

      {galleryImages.length > 0 && (
        <div className={styles.extraGallery}>
          {galleryImages.map((url, i) => {
            const indexInArray = (profileImage && profileImage !== "/placeholder.jpg") ? i + 1 : i;
            return (
              <LightboxWrapper key={url} images={profileImage && profileImage !== "/placeholder.jpg" ? [profileImage, ...galleryImages] : galleryImages} index={indexInArray}>
                <Image src={url} alt={`Home Gallery ${i}`} width={500} height={500} className={styles.extraImage} unoptimized={url.toLowerCase().endsWith('.gif')} />
              </LightboxWrapper>
            );
          })}
        </div>
      )}
      
      <footer className={styles.footer}>
        <p className={styles.copyright}>© 2026 {t.copyright} Anastasiya Teterina.</p>
      </footer>
    </div>
  );
}
