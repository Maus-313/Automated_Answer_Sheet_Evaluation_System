"use client";

export default function BackgroundDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Subtle aurora gradients (light) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90 dark:opacity-0"
        style={{
          backgroundImage:
            "radial-gradient(800px 400px at 8% -10%, rgba(59,130,246,0.12), transparent 60%)," +
            "radial-gradient(600px 300px at 92% 0%, rgba(168,85,247,0.10), transparent 60%)," +
            "radial-gradient(700px 500px at 50% 110%, rgba(16,185,129,0.10), transparent 60%)",
        }}
      />

      {/* Subtle aurora gradients (dark) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(900px 500px at 15% -15%, rgba(37,99,235,0.20), transparent 60%)," +
            "radial-gradient(700px 400px at 85% -10%, rgba(139,92,246,0.18), transparent 60%)," +
            "radial-gradient(800px 600px at 50% 120%, rgba(34,197,94,0.16), transparent 60%)",
        }}
      />

      {/* Soft grid overlay (light) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] dark:opacity-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.5) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Soft grid overlay (dark) */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10] hidden dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.45) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,0.45) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

