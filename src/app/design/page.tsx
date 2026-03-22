import Gallery from "@/components/Gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Works | Anastasiya Teterina",
};

export default function DesignPage() {
  return <Gallery category="design" title="Design Works" />;
}
