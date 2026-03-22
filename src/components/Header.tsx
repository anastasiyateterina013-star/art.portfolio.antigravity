import Link from "next/link";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-left">
        <Link href="/">Home</Link>
        <Link href="/about#contacts">Contacts</Link>
      </div>
      <div className="header-right">
        <Link href="/design">Design works</Link>
        <Link href="/maal">Drawings</Link>
        <Link href="/about">About</Link>
      </div>
    </header>
  );
}
