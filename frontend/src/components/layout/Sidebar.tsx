"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BlogHistoryItem } from "@/types/blog";
import { Icons } from "@/components/ui/Icons";
import { BrandMark } from "@/components/ui/BrandMark";

interface SidebarProps {
  history:       BlogHistoryItem[];
  activeId:      number | null;
  searchQuery:   string;
  onSearchChange: (q: string) => void;
  onSelectItem:  (item: BlogHistoryItem) => void;
  onDeleteItem:  (id: number) => void;
  onNewBlog:     () => void;
  userName:      string | null;
  userEmail:     string | null;
  onLogout:      () => void;
}

export default function Sidebar({
  history, activeId, searchQuery, onSearchChange, onSelectItem, onDeleteItem, onNewBlog,
  userName, userEmail, onLogout,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "appearance" | "general" | "notifications" | "security">("profile");
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  const [saveHistory, setSaveHistory] = useState(true);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [fontScale, setFontScale] = useState<"normal" | "large">("normal");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [productAnnouncements, setProductAnnouncements] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<"30m" | "1h" | "4h">("1h");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"help" | "shortcuts" | "contact">("help");
  const [helpQuery, setHelpQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const helpFAQs = [
    {
      question: "How do I generate a blog post?",
      answer: "Enter your topic in the input box and click Generate. The AI will create title, outline, and full content.",
    },
    {
      question: "Why is generation disabled?",
      answer: "Generation is enabled only when you are signed in and the topic input is not empty.",
    },
    {
      question: "How do I switch dark and light mode?",
      answer: "Open Settings from the sidebar and go to Appearance to select Light or Dark mode.",
    },
    {
      question: "How can I logout safely?",
      answer: "Use Logout in Settings or profile menu. A confirmation popup appears before sign out.",
    },
    {
      question: "Where can I report a bug?",
      answer: "Open Help -> Contact Support and use Email Support with issue details and screenshots.",
    },
  ];

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!profileRef.current) return;
      if (profileRef.current.contains(e.target as Node)) return;
      setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    const savedAppearance = localStorage.getItem("appearance");
    const savedSaveHistory = localStorage.getItem("saveHistory");
    const savedCompactSidebar = localStorage.getItem("compactSidebar");
    const savedFontScale = localStorage.getItem("fontScale");
    const savedEmailUpdates = localStorage.getItem("emailUpdates");
    const savedAnnouncements = localStorage.getItem("productAnnouncements");
    const savedDesktopNotifications = localStorage.getItem("desktopNotifications");
    const savedSessionTimeout = localStorage.getItem("sessionTimeout");

    if (savedAppearance === "light" || savedAppearance === "dark") {
      setAppearance(savedAppearance);
    }
    if (savedSaveHistory === "true" || savedSaveHistory === "false") {
      setSaveHistory(savedSaveHistory === "true");
    }
    if (savedCompactSidebar === "true" || savedCompactSidebar === "false") {
      setCompactSidebar(savedCompactSidebar === "true");
    }
    if (savedFontScale === "normal" || savedFontScale === "large") {
      setFontScale(savedFontScale);
    }
    if (savedEmailUpdates === "true" || savedEmailUpdates === "false") {
      setEmailUpdates(savedEmailUpdates === "true");
    }
    if (savedAnnouncements === "true" || savedAnnouncements === "false") {
      setProductAnnouncements(savedAnnouncements === "true");
    }
    if (savedDesktopNotifications === "true" || savedDesktopNotifications === "false") {
      setDesktopNotifications(savedDesktopNotifications === "true");
    }
    if (savedSessionTimeout === "30m" || savedSessionTimeout === "1h" || savedSessionTimeout === "4h") {
      setSessionTimeout(savedSessionTimeout);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appearance);
    localStorage.setItem("appearance", appearance);
  }, [appearance]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-scale", fontScale);
    localStorage.setItem("fontScale", fontScale);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem("saveHistory", String(saveHistory));
  }, [saveHistory]);

  useEffect(() => {
    localStorage.setItem("compactSidebar", String(compactSidebar));
  }, [compactSidebar]);

  useEffect(() => {
    localStorage.setItem("emailUpdates", String(emailUpdates));
  }, [emailUpdates]);

  useEffect(() => {
    localStorage.setItem("productAnnouncements", String(productAnnouncements));
  }, [productAnnouncements]);

  useEffect(() => {
    localStorage.setItem("desktopNotifications", String(desktopNotifications));
  }, [desktopNotifications]);

  useEffect(() => {
    localStorage.setItem("sessionTimeout", sessionTimeout);
  }, [sessionTimeout]);

  return (
    <aside style={{
      width: compactSidebar ? 228 : 264,
      minWidth: compactSidebar ? 228 : 264,
      height: "100vh",
      position: "sticky", top: 0,
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, zIndex: 50,
    }}>

      {/* ── Logo + Generate New Blog ── */}
      <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <BrandMark size={32} />
        </div>
        <button type="button" className="new-btn" onClick={onNewBlog}>
          <span style={{ display: "flex", alignItems: "center" }}>{Icons.pen}</span>
          Generate New Blog
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 9, color: "var(--text-tertiary)", display: "flex", pointerEvents: "none" }}>
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search history..."
            style={{
              width: "100%", paddingLeft: 30, paddingRight: 10,
              paddingTop: 7, paddingBottom: 7,
              background: "#F5F5F2", border: "1px solid var(--border-light)",
              borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(760px, 94vw)",
              maxHeight: "86vh",
              overflow: "auto",
              borderRadius: 16,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 48px rgba(15,23,42,0.18)",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>Settings</h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  background: "transparent",
                  cursor: "pointer",
                }}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 14 }}>
              <div style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: 8, height: "fit-content" }}>
                {([
                  ["profile", "Profile"],
                  ["appearance", "Appearance"],
                  ["general", "General"],
                  ["notifications", "Notifications"],
                  ["security", "Security"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveSettingsTab(key)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 10,
                      border: "none",
                      background: activeSettingsTab === key ? "var(--hover-bg)" : "transparent",
                      color: "var(--text-primary)",
                      padding: "9px 10px",
                      fontSize: 13,
                      cursor: "pointer",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: 14 }}>
                {activeSettingsTab === "profile" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Profile details</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Username:</strong> {userName || "Guest User"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      <strong style={{ color: "var(--text-primary)" }}>Email:</strong> {userEmail || "Not available"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Account status:</strong> {userName ? "Signed in" : "Not signed in"}
                    </div>
                    {userName && (
                      <div style={{ marginTop: 14 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoutConfirmOpen(true);
                          }}
                          style={{
                            borderRadius: 10,
                            border: "1px solid rgba(220,38,38,0.28)",
                            color: "#DC2626",
                            background: "rgba(220,38,38,0.06)",
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeSettingsTab === "appearance" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Appearance</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      {(["light", "dark"] as const).map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setAppearance(mode)}
                          style={{
                            border: appearance === mode ? "1px solid #6366F1" : "1px solid var(--border)",
                            background: appearance === mode ? "rgba(99,102,241,0.08)" : "transparent",
                            color: "var(--text-primary)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {mode} mode
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Text size</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["normal", "large"] as const).map(scale => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => setFontScale(scale)}
                          style={{
                            border: fontScale === scale ? "1px solid #6366F1" : "1px solid var(--border)",
                            background: fontScale === scale ? "rgba(99,102,241,0.08)" : "transparent",
                            color: "var(--text-primary)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeSettingsTab === "general" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>General settings</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={saveHistory}
                        onChange={e => setSaveHistory(e.target.checked)}
                      />
                      Save generation history
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                      <input
                        type="checkbox"
                        checked={compactSidebar}
                        onChange={e => setCompactSidebar(e.target.checked)}
                      />
                      Use compact sidebar layout
                    </label>
                  </>
                )}

                {activeSettingsTab === "notifications" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Notifications</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={emailUpdates}
                        onChange={e => setEmailUpdates(e.target.checked)}
                      />
                      Receive email updates
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        checked={productAnnouncements}
                        onChange={e => setProductAnnouncements(e.target.checked)}
                      />
                      Product announcements
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                      <input
                        type="checkbox"
                        checked={desktopNotifications}
                        onChange={e => setDesktopNotifications(e.target.checked)}
                      />
                      Desktop notifications
                    </label>
                  </>
                )}

                {activeSettingsTab === "security" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Security</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Auto sign-out timeout</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {([
                        ["30m", "30 min"],
                        ["1h", "1 hour"],
                        ["4h", "4 hours"],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSessionTimeout(value)}
                          style={{
                            border: sessionTimeout === value ? "1px solid #6366F1" : "1px solid var(--border)",
                            background: sessionTimeout === value ? "rgba(99,102,241,0.08)" : "transparent",
                            color: "var(--text-primary)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                      Your selected timeout is saved for this browser session.
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  padding: "9px 12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {helpOpen && (
        <div
          onClick={() => setHelpOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 125,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(760px, 94vw)",
              maxHeight: "86vh",
              overflow: "auto",
              borderRadius: 16,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 48px rgba(15,23,42,0.18)",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>Help</h3>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  background: "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
                aria-label="Close help"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", gap: 14 }}>
              <div style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: 8, height: "fit-content" }}>
                {([
                  ["help", "Help Center"],
                  ["shortcuts", "Keyboard Shortcuts"],
                  ["contact", "Contact Support"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveHelpTab(key)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 10,
                      border: "none",
                      background: activeHelpTab === key ? "var(--hover-bg)" : "transparent",
                      color: "var(--text-primary)",
                      padding: "9px 10px",
                      fontSize: 13,
                      cursor: "pointer",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: 14 }}>
                {activeHelpTab === "help" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>Help Center</div>
                    <input
                      type="text"
                      value={helpQuery}
                      onChange={e => setHelpQuery(e.target.value)}
                      placeholder="Search help topics..."
                      style={{
                        width: "100%",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        background: "transparent",
                        color: "var(--text-primary)",
                        padding: "9px 10px",
                        marginBottom: 12,
                        fontSize: 13,
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {helpFAQs
                        .filter(item => {
                          const q = helpQuery.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            item.question.toLowerCase().includes(q) ||
                            item.answer.toLowerCase().includes(q)
                          );
                        })
                        .map(item => (
                          <details
                            key={item.question}
                            style={{
                              border: "1px solid var(--border-light)",
                              borderRadius: 10,
                              padding: "8px 10px",
                              background: "transparent",
                            }}
                          >
                            <summary style={{ cursor: "pointer", color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>
                              {item.question}
                            </summary>
                            <div style={{ marginTop: 8, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.55 }}>
                              {item.answer}
                            </div>
                          </details>
                        ))}
                    </div>
                  </>
                )}

                {activeHelpTab === "shortcuts" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>
                      Keyboard Shortcuts
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {[
                        ["Ctrl/Cmd + Enter", "Generate blog"],
                        ["Esc", "Close popup dialogs"],
                        ["Ctrl/Cmd + K", "Focus search"],
                      ].map(([key, action]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            border: "1px solid var(--border-light)",
                            borderRadius: 10,
                            padding: "8px 10px",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{key}</span>
                          <span style={{ color: "var(--text-secondary)" }}>{action}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeHelpTab === "contact" && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--text-primary)" }}>
                      Contact Support
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                      Need help with account, billing, or bugs? Reach out and include screenshots for faster support.
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <a
                        href="mailto:support@aiblogagent.app?subject=Support%20Request"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textDecoration: "none",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          padding: "8px 12px",
                          fontSize: 13,
                        }}
                      >
                        Email Support
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          window.alert("Live chat will be available soon.");
                        }}
                        style={{
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                          background: "transparent",
                          color: "var(--text-primary)",
                          padding: "8px 12px",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Start Live Chat
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  padding: "9px 12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History List ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px 10px 8px" }}>
        <div className="sec-label" style={{ paddingLeft: 6, textTransform: "none", letterSpacing: "0.04em", fontSize: 10 }}>Recents blogs</div>
        {saveHistory ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {history.map(item => (
              <div
                key={item.id}
                className={`hist-row${activeId === item.id ? " active" : ""}`}
              >
                <button
                  type="button"
                  className="hist-btn"
                  onClick={() => onSelectItem(item)}
                >
                  <span style={{ display: "flex", color: "var(--text-tertiary)", marginTop: 2, flexShrink: 0 }}>
                    {Icons.doc}
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    } as React.CSSProperties}>
                      {item.title}
                    </span>
                    {item.status === "generating" && (
                      <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#6366F1" }}>
                        Generating...
                      </span>
                    )}
                    {item.status === "failed" && (
                      <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#b91c1c" }}>
                        Failed
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  className="hist-delete"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  aria-label={`Delete ${item.title}`}
                  title="Delete"
                >
                  {Icons.trash}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "6px 8px" }}>
            History is hidden in settings.
          </div>
        )}
      </div>

      {/* ── Settings & Help (below history) ── */}
      <div className="sidebar-footer-nav">
        <button
          type="button"
          className="sidebar-footer-btn"
          onClick={() => {
            setActiveSettingsTab("profile");
            setSettingsOpen(true);
            setHelpOpen(false);
          }}
        >
          <span className="sidebar-footer-icon">{Icons.cog}</span>
          Settings
        </button>
        <button
          type="button"
          className="sidebar-footer-btn"
          onClick={() => {
            setActiveHelpTab("help");
            setHelpOpen(true);
            setSettingsOpen(false);
          }}
        >
          <span className="sidebar-footer-icon">{Icons.help}</span>
          Help
        </button>
      </div>

      {/* ── User Profile (pill + dropdown) ── */}
      <div ref={profileRef} className="sidebar-profile-wrap">
        <button
          type="button"
          className="sidebar-profile-trigger"
          onClick={() => setProfileOpen(v => !v)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
        >
          <span className="sidebar-profile-avatar" aria-hidden>
            {userName?.trim()
              ? userName.trim()[0].toUpperCase()
              : "G"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {userName || "Guest"}
            </div>
            {userName ? (
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                Free plan
              </div>
            ) : null}
          </div>
          <span className="sidebar-profile-chevron" data-open={profileOpen ? "true" : "false"} aria-hidden>
            {Icons.chevron}
          </span>
        </button>

        {profileOpen && (
          <div className="sidebar-profile-dropdown" role="menu">
            {userName ? (
              <>
                <div style={{ padding: "10px 10px 12px", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                    Profile details
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{userName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, wordBreak: "break-word" }}>
                    {userEmail || "—"}
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  className="sidebar-profile-menu-btn"
                  onClick={() => {
                    setActiveSettingsTab("profile");
                    setSettingsOpen(true);
                    setHelpOpen(false);
                    setProfileOpen(false);
                  }}
                >
                  Account & settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="sidebar-profile-menu-btn sidebar-profile-menu-btn--danger"
                  onClick={() => {
                    setProfileOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="sidebar-profile-menu-btn"
                style={{ display: "block", textDecoration: "none", color: "inherit" }}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>

      {logoutConfirmOpen && (
        <div
          onClick={() => setLogoutConfirmOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 140,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(420px, 92vw)",
              borderRadius: 14,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 22px 48px rgba(15,23,42,0.22)",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Confirm Logout
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Are you sure you want to logout from your account?
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  setSettingsOpen(false);
                  setProfileOpen(false);
                  onLogout();
                }}
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(220,38,38,0.28)",
                  color: "#DC2626",
                  background: "rgba(220,38,38,0.08)",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
