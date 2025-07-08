import React from "react";
import Link from "next/link";
import type { Level } from "../levels/levels";

interface LevelSelectProps {
  levels: Level[];
  completed: Set<number>;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  levels,
  completed,
}) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 700,
        margin: "0 auto",
        background: "#181818",
        border: "2px solid var(--terminal-green)",
        borderRadius: 8,
        padding: 24,
        marginTop: 32,
        boxShadow: "0 0 32px #000",
      }}
    >
      <h2
        style={{
          color: "var(--terminal-cyan)",
          fontSize: 28,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Level-Auswahl
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {levels.map((level) => (
          <Link
            key={level.id}
            href={`/level/${level.id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: completed.has(level.id) ? "#222" : "#181818",
                border: completed.has(level.id)
                  ? "2px solid var(--terminal-green)"
                  : "1px solid #333",
                borderRadius: 6,
                padding: "12px 18px",
                cursor: "pointer",
                transition: "background 0.2s, border 0.2s",
                gap: 18,
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  color: "var(--terminal-green)",
                  fontSize: 18,
                  minWidth: 120,
                }}
              >
                {level.name}
              </span>
              <span
                style={{
                  color: "var(--terminal-yellow)",
                  fontSize: 18,
                  marginLeft: 8,
                }}
              >
                {"★".repeat(level.difficulty)}
                {"☆".repeat(5 - level.difficulty)}
              </span>
              <span
                style={{
                  flex: 1,
                  color: "var(--terminal-cyan)",
                  fontSize: 15,
                  marginLeft: 16,
                }}
              >
                {level.tutorial}
              </span>
              {completed.has(level.id) && (
                <span
                  style={{
                    color: "var(--terminal-green)",
                    fontSize: 22,
                    marginLeft: 16,
                  }}
                >
                  ✔️
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
