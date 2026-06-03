"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { BrandMark } from "@/components/ui/BrandMark";

interface NavbarProps {
  onToggleSidebar: () => void;
  userName: string | null;
}

function userFirstLetter(name: string | null): string {
  if (!name?.trim()) return "?";
  return name.trim()[0].toUpperCase();
}

export default function Navbar({ onToggleSidebar, userName }: NavbarProps) {
  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          type="button"
          className="app-header-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {Icons.menu}
        </button>

        <div className="app-header-brand">
          <BrandMark size={30} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
            <span className="app-header-title">AI Blog Writing Agent</span>
            <span className="app-header-tagline">Write SEO friendly blog in minutes</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {userName ? (
          <div className="app-header-user" title={userName}>
            <span className="app-header-avatar" aria-hidden>
              {userFirstLetter(userName)}
            </span>
            <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName}
            </span>
          </div>
        ) : (
          <>
            <Link href="/signin" className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }}>
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
