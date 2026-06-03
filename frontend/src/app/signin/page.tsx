"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { signIn } from "@/lib/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      router.refresh();
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signin failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "40px 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        borderRadius: "var(--r-lg)",
        boxShadow: "0 18px 45px rgba(15,23,42,0.10)",
        padding: "28px 26px 26px",
        border: "1px solid var(--border-light)",
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 24,
            fontWeight: 800,
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "-0.6px",
            color: "var(--text-primary)",
            marginBottom: 6,
          }}>
            Welcome back
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Sign in to continue generating SEO-optimized blogs.
          </div>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "9px 11px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                fontSize: 13,
              }}
            />
          </label>

          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "9px 11px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                fontSize: 13,
              }}
            />
          </label>

          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 13.5,
              marginTop: 4,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 4, width: "100%", padding: "9px 0", fontSize: 13.5 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-secondary)", textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: "var(--black)", fontWeight: 500 }}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

