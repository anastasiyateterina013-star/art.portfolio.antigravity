import Link from "next/link";
import "./Header.css";
import LanguageToggle from "./LanguageToggle";
import { cookies } from "next/headers";

export default async function Header() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const t = {
    home: lang === "et" ? "AVALEHT" : "HOME",
    contacts: lang === "et" ? "KONTAKT" : "CONTACTS",
    design: lang === "et" ? "DISAINITÖÖD" : "DESIGN WORKS",
    drawings: lang === "et" ? "MAALID" : "DRAWINGS",
    about: lang === "et" ? "MINUST" : "ABOUT"
  };

  return (
    <header className="site-header">
      <div className="header-left">
        <Link href="/">{t.home}</Link>
      </div>
      <div className="header-right">
        <Link href="/design">{t.design}</Link>
        <Link href="/maal">{t.drawings}</Link>
        <Link href="/about">{t.about}</Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
