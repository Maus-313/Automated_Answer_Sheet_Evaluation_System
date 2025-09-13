"use client";

import { useEffect, useState } from "react";

export default function LoadingDots({ label = "Loading" }: { label?: string }) {
  const [idx, setIdx] = useState(0);
  const seq = [1, 2, 3, 2]; // up to 3 dots, then back down

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((v) => (v + 1) % seq.length);
    }, 400);
    return () => clearInterval(id);
  }, []);

  const dots = ".".repeat(seq[idx]);
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {label}
      {dots}
    </span>
  );
}

