import Gallery from "@/components/Gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drawings | Anastasiya Teterina",
};

export default function PaintingsPage() {
  return <Gallery category="painting" title="Drawings & Paintings" />;
}
