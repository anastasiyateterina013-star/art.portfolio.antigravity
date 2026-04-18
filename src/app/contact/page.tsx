import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import RichText from "@/components/RichText";
import Image from "next/image";

export default async function ContactPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  let pageContent = await prisma.pageContent.findUnique({
    where: { id: lang === "et" ? "contacts_et" : "contacts" },
  });
  if (!pageContent && lang === "et") {
    pageContent = await prisma.pageContent.findUnique({ where: { id: "contacts" } });
  }

  const t = {
    contacts: lang === "et" ? "Kontakt" : "Contacts"
  };

  const contentText = pageContent?.content ?? "Contact information will appear here.";
  const sideImage = pageContent?.mainImage;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "var(--spacing-xl) 0" }}>
      <h1 style={{ marginBottom: "var(--spacing-lg)" }}>{t.contacts}</h1>

      <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>
        {/* Text column */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <RichText content={contentText} />
        </div>

        {/* Decorative side image — sticky so it stays beside text as you scroll */}
        {sideImage && (
          <div style={{
            flex: "0 0 260px",
            position: "sticky",
            top: "120px",
            alignSelf: "flex-start",
          }}>
            <Image
              src={sideImage}
              alt="Contact illustration"
              width={260}
              height={400}
              unoptimized={sideImage.toLowerCase().endsWith('.gif')}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
