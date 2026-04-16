import Gallery from "@/components/Gallery";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Design Works | Anastasiya Teterina",
};

export default async function DesignPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const title = lang === "et" ? "Disainitööd" : "Design Works";
  return <Gallery category="design" title={title} />;
}
