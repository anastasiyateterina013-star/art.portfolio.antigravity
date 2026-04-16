"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const router = useRouter();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    // Read the current cookie on mount
    const match = document.cookie.match(new RegExp("(^| )lang=([^;]+)"));
    if (match) setLang(match[2]);
  }, []);

  const toggleLang = (newLang: string) => {
    // Set cookie for 1 year
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
    setLang(newLang);
    router.refresh(); // Refresh the current Server Components
  };

  return (
    <div style={{ display: "inline-flex", gap: "10px", marginLeft: "20px", fontSize: "14px", letterSpacing: "1px", alignItems: "center" }}>
      <button 
        onClick={() => toggleLang("en")} 
        style={{ 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          color: "inherit",
          fontFamily: "inherit",
          fontWeight: lang === "en" ? "bold" : "normal", 
          textDecoration: lang === "en" ? "underline" : "none" 
        }}
      >
        EN
      </button>
      <span>|</span>
      <button 
        onClick={() => toggleLang("et")} 
        style={{ 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          color: "inherit",
          fontFamily: "inherit",
          fontWeight: lang === "et" ? "bold" : "normal", 
          textDecoration: lang === "et" ? "underline" : "none" 
        }}
      >
        ET
      </button>
    </div>
  );
}
