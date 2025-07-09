import React, { useRef, useEffect, useState } from "react";
import type { Level } from "../levels/levels";

interface GameBoardProps {
  level: Level;
  robotPosition: {
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
  };
  berriesCollected?: number[]; // Indizes der gesammelten Berries (optional)
}

const tileChar = (tile: string) => {
  if (tile === "wall")
    return (
      <span
        style={{ color: "#39FF14", background: "#222", fontWeight: "bold" }}
      >
        █
      </span>
    );
  if (tile === "goal")
    return <span style={{ color: "#FFD600", fontWeight: "bold" }}>⚑</span>;
  if (tile === "berry")
    return <span style={{ color: "#00fff7", fontWeight: "bold" }}>$</span>;
  if (tile === "empty" || tile === "start")
    return <span style={{ color: "#444" }}>·</span>;
  return <span>?</span>;
};

const robotChar = (direction: string) => {
  // Neon-Grün mit Schatten für Sichtbarkeit
  const style = {
    color: "#39FF14",
    textShadow: "0 0 6px #39FF14, 0 0 2px #39FF14",
    fontWeight: "bold" as const,
  };
  if (direction === "up") return <span style={style}>▲</span>;
  if (direction === "down") return <span style={style}>▼</span>;
  if (direction === "left") return <span style={style}>◀</span>;
  if (direction === "right") return <span style={style}>▶</span>;
  return <span style={style}>R</span>;
};

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  robotPosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(32);

  // Dynamisch die Schriftgröße anpassen, damit das Grid maximal groß ist
  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      const width = containerRef.current!.offsetWidth;
      const height = containerRef.current!.offsetHeight;
      const cols = level.grid[0].length;
      const rows = level.grid.length;
      // Dynamische Anpassung: Je mehr Felder, desto kleiner die Schrift
      // 0.95 für etwas Padding, 1.25 für Zeilenhöhe
      const sizeW = (width / cols) * 0.95;
      const sizeH = (height / rows) * 0.95;
      setFontSize(Math.floor(Math.min(sizeW, sizeH, 80)));
    };
    // Initial-Resize nach dem Render (Workaround für Split.js/SSR)
    requestAnimationFrame(resize);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [level.grid]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        border: "2px solid #39FF14",
        borderRadius: 8,
        boxShadow: "0 0 16px #111",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#181818",
          borderRadius: 6,
          border: "1.5px solid #222",
        }}
      >
        <pre
          style={{
            fontFamily: "inherit",
            color: "var(--terminal-green)",
            background: "transparent",
            fontSize,
            lineHeight: 1.1,
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            userSelect: "none",
            letterSpacing: 2,
          }}
        >
          {level.grid.map((row, y) => (
            <div key={y}>
              {row.map((tile, x) =>
                robotPosition &&
                typeof robotPosition.x === "number" &&
                typeof robotPosition.y === "number" &&
                robotPosition.x === x &&
                robotPosition.y === y ? (
                  <span key={`${x}-${y}`}>
                    {robotChar(robotPosition.direction)}
                  </span>
                ) : (
                  <span key={`${x}-${y}`}>{tileChar(tile)}</span>
                )
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
