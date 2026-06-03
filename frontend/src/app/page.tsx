"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

import BlogInput from "@/components/blog/BlogInput";
import BlogOutput from "@/components/blog/BlogOutput";

import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { Icons } from "@/components/ui/Icons";

import { useBlogHistory } from "@/hooks/useBlogHistory";
import { generateBlog, regenerateBlog } from "@/services/blogService";
import { clearStoredToken, deleteMyBlog, fetchMe, getStoredToken, signOut } from "@/lib/auth";

const GUEST_DEMO_KEY = "aiblog_guest_demo_used";
const LOADING_PHASES = [
  "Planning your SEO strategy...",
  "Researching high-impact keywords...",
  "Crafting your SEO-optimized blog post...",
] as const;

function guestDemoConsumed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_DEMO_KEY) === "1";
}

function markGuestDemoConsumed() {
  localStorage.setItem(GUEST_DEMO_KEY, "1");
}

export default function HomePage() {

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Blog states
  const [topic, setTopic] = useState("");
  const [generationBusy, setGenerationBusy] = useState(false);
  const [liveWritingId, setLiveWritingId] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);
  const [runningChatId, setRunningChatId] = useState<number | null>(null);
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);

  // Search
  const [search, setSearch] = useState("");

  // Scroll ref
  const outputRef = useRef<HTMLDivElement>(null);
  const generateAbortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<number | null>(null);

  // History
  const {
    history,
    activeId,
    upsertHistoryItem,
    createPendingHistoryItem,
    markHistoryItemGenerating,
    markHistoryItemIdle,
    markHistoryItemFailed,
    getHistoryItem,
    setActive,
    removeHistoryItem,
    filterHistory,
    replaceHistory,
    loadMyBlogs
  } = useBlogHistory();

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      setUserName(null);
      setUserEmail(null);
      replaceHistory([]);
      setTopic("");
      setLiveWritingId(null);
      setPageError("");
    }
  }

  useEffect(() => {
    async function init() {
      const token = getStoredToken();
      if (!token) return;

      try {
        const me = await fetchMe();
        setUserName(me.user.name);
        setUserEmail(me.user.email);
      } catch {
        clearStoredToken();
        setUserName(null);
        setUserEmail(null);
        replaceHistory([]);
        return;
      }

      try {
        await loadMyBlogs();
        setActive(null);
        setTopic("");
        setLiveWritingId(null);
      } catch {
        replaceHistory([]);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeItem = getHistoryItem(activeId);
  const activeResult = activeItem?.content ?? null;
  const activeStatus = activeItem?.status ?? "idle";
  const activeError = activeStatus === "failed" ? activeItem?.error || "" : "";
  const showLoadingPanel = activeStatus === "generating";
  const showResultPanel = activeStatus === "completed" && Boolean(activeResult);
  const showHero = !activeItem && !generationBusy;
  const visibleError = activeError || pageError;
  const loadingPhaseText = LOADING_PHASES[loadingPhaseIndex];

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!showLoadingPanel) {
      setLoadingPhaseIndex(0);
      return;
    }

    setLoadingPhaseIndex(0);
    const toSecond = window.setTimeout(() => setLoadingPhaseIndex(1), 7000);
    const toThird = window.setTimeout(() => setLoadingPhaseIndex(2), 14000);

    return () => {
      window.clearTimeout(toSecond);
      window.clearTimeout(toThird);
    };
  }, [showLoadingPanel]);

  function handleStopGenerating() {
    generateAbortRef.current?.abort();
    if (runningChatId != null) {
      markHistoryItemIdle(runningChatId);
      setLiveWritingId(current => (current === runningChatId ? null : current));
    }
    setGenerationBusy(false);
    setRunningChatId(null);
  }

  // ─────────────────────────────
  // Generate Blog
  // ─────────────────────────────
  async function handleGenerate() {

    if (!topic.trim() || generationBusy) return;

    const currentActiveId = activeId;
    const currentActiveItem = getHistoryItem(currentActiveId);
    const shouldRegenerateInPlace = Boolean(currentActiveItem?.content && currentActiveId);

    if (!userName && guestDemoConsumed() && !shouldRegenerateInPlace) {
      setPageError("");
      setSignInPromptOpen(true);
      return;
    }

    generateAbortRef.current?.abort();
    const ac = new AbortController();
    generateAbortRef.current = ac;

    setGenerationBusy(true);
    setPageError("");

    let targetId: number;
    if (shouldRegenerateInPlace && currentActiveId) {
      markHistoryItemGenerating(currentActiveId, topic);
      targetId = currentActiveId;
    } else {
      targetId = createPendingHistoryItem(topic).id;
    }

    setRunningChatId(targetId);
    setLiveWritingId(null);
    setActive(targetId);

    try {

      const res = shouldRegenerateInPlace && currentActiveId
        ? await regenerateBlog(currentActiveId, { topic }, ac.signal)
        : await generateBlog({ topic }, ac.signal);

      if (ac.signal.aborted || res.aborted) {
        return;
      }

      if (!res.success || !res.data) {
        markHistoryItemFailed(targetId, res.error || "Blog generation failed", topic);
      } else {

        if (!userName && !shouldRegenerateInPlace) {
          markGuestDemoConsumed();
        }
        const savedItem = shouldRegenerateInPlace
          ? upsertHistoryItem(res.data, currentActiveId)
          : upsertHistoryItem(res.data, targetId);
        setLiveWritingId(savedItem.id);
        if (activeIdRef.current === targetId) {
          setTopic(savedItem.title);
        }

        if (activeIdRef.current === targetId) {
          setTimeout(() => {
            outputRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }, 150);
        }
      }

    } catch (err) {
      if (!ac.signal.aborted) {
        markHistoryItemFailed(targetId, "Server error. Please try again.", topic);
      }
    } finally {
      generateAbortRef.current = null;
      setGenerationBusy(false);
      setRunningChatId(null);
    }
  }


  // ─────────────────────────────
  // Select blog from history
  // ─────────────────────────────
  function handleSelectHistory(item: ReturnType<typeof filterHistory>[number]) {

    setLiveWritingId(null);
    setTopic(item.title);
    setActive(item.id);
    setPageError("");

    setTimeout(() => {
      outputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }


  // ─────────────────────────────
  // Start new blog
  // ─────────────────────────────
  function handleNewBlog() {
    setLiveWritingId(null);
    setTopic("");
    setActive(null);
    setPageError("");
  }

  async function handleDeleteHistoryItem(id: number) {
    const previousHistory = history;
    const deletingActive = activeId === id;

    removeHistoryItem(id);
    if (deletingActive) {
      setLiveWritingId(null);
      setTopic("");
      setPageError("");
    }

    if (!userName) return;

    try {
      await deleteMyBlog(id);
    } catch {
      replaceHistory(previousHistory);
      if (deletingActive) {
        const restored = previousHistory.find(item => item.id === id);
        if (restored) {
          setTopic(restored.title);
          setActive(id);
        }
      }
      setPageError("Could not delete blog. Please try again.");
    }
  }


  const filteredHistory = filterHistory(search);


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)"
      }}
    >

      {/* Sidebar */}

      {sidebarOpen && (
        <Sidebar
          history={filteredHistory}
          activeId={activeId}
          searchQuery={search}
          onSearchChange={setSearch}
          onSelectItem={handleSelectHistory}
          onDeleteItem={handleDeleteHistoryItem}
          onNewBlog={handleNewBlog}
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      )}


      {/* Main Panel */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >

        <Navbar
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          userName={userName}
        />

        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "0 28px"
          }}
        >

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>


            {/* Hero */}

            {showHero && (
              <div style={{ textAlign: "center", padding: "70px 0 40px" }}>

                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 48,
                    fontWeight: 400,
                    letterSpacing: "-2px",
                    marginBottom: 20
                  }}
                >
                  Rank Higher. Write Faster. Convert Better.
                </h1>

                <p
                  style={{
                    fontSize: 16,
                    color: "var(--text-secondary)",
                    maxWidth: 600,
                    margin: "0 auto",
                    lineHeight: 1.7
                  }}
                >
                  Generate SEO-optimized blog posts in minutes with AI-powered
                  research, structured outlines, and keyword-rich content.
                </p>

              </div>
            )}


            {/* Back button */}

            {showResultPanel && (
              <div style={{ paddingTop: 28, marginBottom: 20 }}>
                <button
                  type="button"
                  className="new-blog-header-btn"
                  onClick={handleNewBlog}
                >
                  <span className="new-blog-header-btn__icon">{Icons.arrowLeft}</span>
                  New blog
                </button>
              </div>
            )}


            {/* Blog topic — hidden while a finished article is shown */}
            {(!showResultPanel || showLoadingPanel) && (
              <div style={{ marginTop: showHero ? 0 : 14 }}>
                <BlogInput
                  topic={topic}
                  loading={generationBusy}
                  onChange={setTopic}
                  onGenerate={handleGenerate}
                  onStopGenerating={runningChatId === activeId ? handleStopGenerating : undefined}
                />
              </div>
            )}


            {/* Error */}

            {visibleError && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#991B1B"
                }}
              >
                {visibleError}
              </div>
            )}


            {/* Loading */}

            {showLoadingPanel && (
              <>
                <div
                  style={{
                    marginTop: 22,
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#4B5563",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    paddingLeft: 2,
                  }}
                >
                  <span className="pulse" aria-hidden="true" style={{ color: "#9CA3AF" }}>✦</span>
                  {loadingPhaseText}
                </div>
                <SkeletonLoader />
              </>
            )}


            {/* Blog Output */}

            {showResultPanel && activeResult && (
              <div ref={outputRef}>
                <BlogOutput
                  result={activeResult}
                  onRegen={handleGenerate}
                  enableLiveWriting={liveWritingId === activeItem?.id}
                />
              </div>
            )}

          </div>

        </main>

      </div>

      {signInPromptOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-prompt-title"
          onClick={() => setSignInPromptOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 160,
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              borderRadius: 16,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 48px rgba(15,23,42,0.2)",
              padding: "22px 22px 18px",
            }}
          >
            <h2
              id="sign-in-prompt-title"
              style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}
            >
              Sign in to keep generating
            </h2>
            <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              You&apos;ve used your free preview blog. Create an account or sign in to generate unlimited posts and save them to your history.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              <Link
                href="/signin"
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 18px",
                  fontSize: 14,
                  textDecoration: "none",
                  borderRadius: 12,
                }}
                onClick={() => setSignInPromptOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 18px",
                  fontSize: 14,
                  textDecoration: "none",
                  borderRadius: 12,
                }}
                onClick={() => setSignInPromptOpen(false)}
              >
                Create account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setSignInPromptOpen(false)}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "9px 12px",
                fontSize: 13,
                color: "var(--text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: 10,
              }}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
