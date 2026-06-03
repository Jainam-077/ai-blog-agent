"use client";

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
// Shown while AI is generating the blog post (Day 11 – loading animations)

export default function SkeletonLoader() {
  return (
    <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Card 1 */}
      <div className="ocard">
        <div className="skel" style={{ width: "60%", marginBottom: 12 }} />
        <div className="skel" style={{ width: "90%", marginBottom: 8 }} />
        <div className="skel" style={{ width: "75%" }} />
      </div>

      {/* Card 2 */}
      <div className="ocard">
        {[85, 70, 90, 60].map((w, i) => (
          <div
            key={i}
            className="skel"
            style={{
              width: `${w}%`,
              marginBottom: i < 3 ? 10 : 0,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

    </div>
  );
}
