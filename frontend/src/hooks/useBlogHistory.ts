import { useState } from "react";
import { BlogHistoryItem, BlogResult } from "@/types/blog";
import { fetchMyBlogs } from "@/lib/auth";

export function useBlogHistory() {
  const [history,  setHistory]  = useState<BlogHistoryItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  function createTempId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  function replaceHistory(items: BlogHistoryItem[]) {
    setHistory(items);
    setActiveId(items[0]?.id ?? null);
  }

  function createPendingHistoryItem(title: string): BlogHistoryItem {
    const item: BlogHistoryItem = {
      id: createTempId(),
      title: title.trim() || "Untitled blog",
      content: null,
      createdAt: new Date(),
      status: "generating",
      error: "",
    };

    setHistory(prev => [item, ...prev]);
    setActiveId(item.id);
    return item;
  }

  function addToHistory(blog: BlogResult): BlogHistoryItem {
    const itemId = blog.id ?? createTempId();
    const item: BlogHistoryItem = {
      id:        itemId,
      title:     blog.title,
      content:   blog,
      createdAt: new Date(),
      status:    "completed",
      error:     "",
    };
    setHistory(prev => [item, ...prev]);
    setActiveId(item.id);
    return item;
  }

  function upsertHistoryItem(blog: BlogResult, targetId?: number | null): BlogHistoryItem {
    const itemId = targetId ?? blog.id ?? createTempId();
    const finalId = blog.id ?? itemId;
    const item: BlogHistoryItem = {
      id: finalId,
      title: blog.title,
      content: blog,
      createdAt: new Date(),
      status: "completed",
      error: "",
    };

    setHistory(prev => {
      const index = prev.findIndex(entry => entry.id === itemId);
      if (index === -1) return [item, ...prev];

      const next = [...prev];
      next[index] = {
        ...next[index],
        id: finalId,
        title: blog.title,
        content: blog,
        createdAt: new Date(),
        status: "completed",
        error: "",
      };
      return next;
    });

    setActiveId(current => (current === itemId ? finalId : current));
    return item;
  }

  function markHistoryItemGenerating(id: number, title?: string) {
    setHistory(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            title: title?.trim() || item.title,
            status: "generating",
            error: "",
            createdAt: new Date(),
          }
        : item
    ));
  }

  function markHistoryItemIdle(id: number, title?: string) {
    setHistory(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            title: title?.trim() || item.title,
            status: item.content ? "completed" : "idle",
            error: "",
            createdAt: new Date(),
          }
        : item
    ));
  }

  function markHistoryItemFailed(id: number, error: string, title?: string) {
    setHistory(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            title: title?.trim() || item.title,
            status: "failed",
            error,
            createdAt: new Date(),
          }
        : item
    ));
  }

  function getHistoryItem(id: number | null) {
    if (id == null) return null;
    return history.find(item => item.id === id) ?? null;
  }

  function setActive(id: number | null) {
    setActiveId(id);
  }

  function removeHistoryItem(id: number) {
    setHistory(prev => prev.filter(h => h.id !== id));
    setActiveId(current => (current === id ? null : current));
  }

  async function loadMyBlogs() {
    const raw = await fetchMyBlogs();

    const items: BlogHistoryItem[] = raw.map(b => ({
      id: b.id,
      title: b.title,
      content: {
        id: b.id,
        title: b.title,
        content: b.content
      },
      createdAt: new Date(b.created_at),
      status: "completed",
      error: "",
    }));

    replaceHistory(items);
  }

  function filterHistory(query: string): BlogHistoryItem[] {
    if (!query.trim()) return history;
    return history.filter(h =>
      h.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  return {
    history,
    activeId,
    addToHistory,
    upsertHistoryItem,
    createPendingHistoryItem,
    markHistoryItemGenerating,
    markHistoryItemIdle,
    markHistoryItemFailed,
    getHistoryItem,
    setActive,
    removeHistoryItem,
    filterHistory,
    loadMyBlogs,
    replaceHistory,
  };
}
