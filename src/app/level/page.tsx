"use client";
import { useEffect, useState } from "react";
import { levels } from "../../levels/levels";
import { LevelSelect } from "../../components/LevelSelect";

export default function LevelPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fortschritt aus Local Storage laden
    const raw = localStorage.getItem("completedLevels");
    if (raw) {
      try {
        const arr = JSON.parse(raw) as number[];
        setCompleted(new Set(arr));
      } catch {}
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--terminal-bg)",
        padding: 0,
        margin: 0,
        fontFamily: "inherit",
      }}
    >
      <LevelSelect levels={levels} completed={completed} />
    </main>
  );
}
