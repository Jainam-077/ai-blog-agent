"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { signUp } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name is required.");
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (!email.trim()) return setError("Email is required.");
    if (!password.trim()) return setError("Password is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.refresh();
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
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
            Create your account
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Get started with AI-powered blog generation in minutes.
          </div>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
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
              placeholder="Create a strong password"
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
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-secondary)", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/signin" style={{ color: "var(--black)", fontWeight: 500 }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

