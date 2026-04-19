"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";

export default function LightboxWrapper({
  children,
  images,
  index = 0,
}: {
  children: React.ReactNode;
  images: string[];
  index?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer", display: "contents" }}>
        {children}
      </div>
      {open && <Lightbox images={images} initialIndex={index} onClose={() => setOpen(false)} />}
    </>
  );
}
