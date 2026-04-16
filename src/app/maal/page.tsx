import Gallery from "@/components/Gallery";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Drawings | Anastasiya Teterina",
};

export default async function PaintingsPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const title = lang === "et" ? "Joonistused ja Maalid" : "Drawings & Paintings";
  return <Gallery category="painting" title={title} />;
}
