"use client";
import { useEffect, useState } from "react";
import { levels } from "../../levels/levels";
import { LevelSelect } from "../../components/LevelSelect";

export default function LevelPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [allLevels, setAllLevels] = useState(levels);

  useEffect(() => {
    // Fortschritt aus Local Storage laden
    const raw = localStorage.getItem("completedLevels");
    if (raw) {
      try {
        const arr = JSON.parse(raw) as number[];
        setCompleted(new Set(arr));
      } catch {}
    }
    // User-Levels aus Local Storage laden und mergen
    const userRaw = localStorage.getItem("userLevels");
    if (userRaw) {
      try {
        const userArr = JSON.parse(userRaw);
        // Nur Levels mit id, name, difficulty etc. übernehmen
        if (Array.isArray(userArr)) {
          // IDs der Standardlevels
          const stdIds = new Set(levels.map((l) => l.id));
          // Nur User-Levels, die nicht schon als Standardlevel existieren
          const filtered = userArr.filter((l) => !stdIds.has(l.id));
          setAllLevels([...levels, ...filtered]);
        }
      } catch {
        setAllLevels(levels);
      }
    } else {
      setAllLevels(levels);
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
      <LevelSelect levels={allLevels} completed={completed} />
    </main>
  );
}
