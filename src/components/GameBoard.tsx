import React, { useRef, useEffect, useState } from "react";
import type { Level } from "../levels/levels";

interface GameBoardProps {
  level: Level;
  robotPosition: {
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
  };
}

const tileChar = (tile: string) => {
  if (tile === "wall") return "█";
  if (tile === "goal") return "⚑";
  if (tile === "empty" || tile === "start") return ".";
  return "?";
};

const robotChar = (direction: string) => {
  if (direction === "up") return "^";
  if (direction === "down") return "v";
  if (direction === "left") return "<";
  if (direction === "right") return ">";
  return "R";
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
      // 0.9 Faktor für Padding, 1.8 für Zeilenhöhe
      const sizeW = (width / cols) * 0.9;
      const sizeH = height / rows / 1.2;
      setFontSize(Math.floor(Math.min(sizeW, sizeH, 80)));
    };
    resize();
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
      }}
    >
      <pre
        style={{
          fontFamily: "inherit",
          color: "var(--terminal-green)",
          background: "var(--terminal-bg)",
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
        }}
      >
        {level.grid.map(
          (row, y) =>
            row
              .map((tile, x) => {
                if (robotPosition.x === x && robotPosition.y === y) {
                  return robotChar(robotPosition.direction);
                }
                return tileChar(tile);
              })
              .join("") + "\n"
        )}
      </pre>
    </div>
  );
};
