"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { levels } from "../../../levels/levels";
import { GameBoard } from "../../../components/GameBoard";
import { CodeEditor } from "../../../components/CodeEditor";
import { validatePseudoCode } from "../../../utils/pseudocodeValidation";
import { executePseudoCode } from "../../../utils/pseudocodeInterpreter";
import Split from "split.js";

export default function LevelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const level = levels.find((l) => l.id === id);
  const [code, setCode] = useState("");
  const [robotPosition, setRobotPosition] = useState(level?.start);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const errors = validatePseudoCode(code);

  // Split.js Refs
  const col1Ref = useRef<HTMLDivElement>(null); // Aufgabe
  const col2Ref = useRef<HTMLDivElement>(null); // Code+Console
  const col3Ref = useRef<HTMLDivElement>(null); // GameBoard
  const codeRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Local Storage Key
  const codeKey = `levelCode_${id}`;

  useEffect(() => {
    if (!level) return;
    // Lade Code aus Local Storage
    const saved = localStorage.getItem(codeKey);
    if (saved) setCode(saved);
    setRobotPosition(level.start);
    setLogs([]);
    setLevelCompleted(false);
  }, [id, level]);

  useEffect(() => {
    if (!level) return;
    localStorage.setItem(codeKey, code);
  }, [code, codeKey, level]);

  // Split.js Setup
  useEffect(() => {
    if (col1Ref.current && col2Ref.current && col3Ref.current) {
      Split([col1Ref.current, col2Ref.current, col3Ref.current], {
        direction: "horizontal",
        sizes: [20, 40, 40],
        minSize: [180, 250, 200],
        gutterSize: 12,
        gutter: (index, direction) => {
          const gutter = document.createElement("div");
          gutter.className = `gutter gutter-${direction}`;
          gutter.innerHTML =
            '<span style="color:#39FF14;font-size:18px;user-select:none;">||</span>';
          gutter.style.display = "flex";
          gutter.style.alignItems = "center";
          gutter.style.justifyContent = "center";
          gutter.style.background = "#222";
          gutter.style.cursor = "col-resize";
          gutter.style.height = "100%";
          return gutter;
        },
      });
    }
    if (codeRef.current && consoleRef.current) {
      Split([codeRef.current, consoleRef.current], {
        direction: "vertical",
        sizes: [65, 35],
        minSize: [80, 60],
        gutterSize: 10,
        gutter: (index, direction) => {
          const gutter = document.createElement("div");
          gutter.className = `gutter gutter-${direction}`;
          gutter.innerHTML =
            '<span style="color:#39FF14;font-size:18px;user-select:none;">=</span>';
          gutter.style.display = "flex";
          gutter.style.alignItems = "center";
          gutter.style.justifyContent = "center";
          gutter.style.background = "#222";
          gutter.style.cursor = "row-resize";
          gutter.style.width = "100%";
          return gutter;
        },
      });
    }
  }, []);

  const handleRun = async () => {
    if (!level || errors.length > 0) return;
    setIsRunning(true);
    setLogs([]);
    setLevelCompleted(false);
    let success = false;
    const result = executePseudoCode(code, level);
    const history = result.states;
    for (let i = 1; i < history.length; i++) {
      await new Promise((res) => setTimeout(res, 400));
      setRobotPosition(history[i]);
      setLogs((prev) => [
        ...prev,
        `Step ${i}: (${history[i].x},${history[i].y}) ${history[i].direction}`,
      ]);
    }
    setIsRunning(false);
    // Ziel-Check + Berries
    const last = history[history.length - 1];
    const allBerriesCollected = Object.values(result.berries).every((v) => v);
    if (
      last.x === level.goal.x &&
      last.y === level.goal.y &&
      allBerriesCollected
    ) {
      setLogs((prev) => [
        ...prev,
        "> Success: Ziel und alle Berries erreicht!",
      ]);
      setLevelCompleted(true);
      // Fortschritt speichern
      const raw = localStorage.getItem("completedLevels");
      let arr: number[] = [];
      if (raw) {
        try {
          arr = JSON.parse(raw);
        } catch {}
      }
      if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem("completedLevels", JSON.stringify(arr));
      }
      success = true;
    } else if (!allBerriesCollected) {
      setLogs((prev) => [
        ...prev,
        "> Fehler: Nicht alle Berries eingesammelt.",
      ]);
      setTimeout(() => setRobotPosition(level.start), 1200);
    } else {
      setLogs((prev) => [...prev, "> Fehler: Ziel nicht erreicht."]);
      setTimeout(() => setRobotPosition(level.start), 1200);
    }
  };

  const handleReset = () => {
    if (!level) return;
    setRobotPosition(level.start);
    setIsRunning(false);
    setLogs([]);
    setLevelCompleted(false);
  };

  if (!level) {
    return (
      <main style={{ color: "var(--terminal-red)", padding: 40 }}>
        <h2>Level nicht gefunden</h2>
        <button onClick={() => router.push("/level")}>
          Zurück zur Auswahl
        </button>
      </main>
    );
  }

  // Zeilennummern für Editor
  const codeLines = code.split(/\r?\n/);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box",
        padding: 10,
        background: "var(--terminal-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => router.push("/level")}
          style={{
            color: "var(--terminal-cyan)",
            background: "none",
            border: "1px solid var(--terminal-cyan)",
            borderRadius: 4,
            padding: "4px 16px",
            fontWeight: "bold",
            marginBottom: 16,
            cursor: "pointer",
          }}
        >
          [ Zurück zur Auswahl ]
        </button>
        <h2
          style={{
            color: "var(--terminal-green)",
            fontSize: 28,
            marginBottom: 8,
          }}
        >
          {level.name}{" "}
          {levelCompleted && (
            <span style={{ color: "var(--terminal-green)", fontSize: 24 }}>
              ✔️
            </span>
          )}
        </h2>
        <div
          style={{
            color: "var(--terminal-yellow)",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          {"★".repeat(level.difficulty)}
          {"☆".repeat(5 - level.difficulty)}
        </div>
        <div
          style={{
            color: "var(--terminal-cyan)",
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          {level.tutorial}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          border: "2px solid var(--terminal-green)",
          background: "var(--terminal-bg)",
          marginTop: 0,
        }}
      >
        {/* Spalte 1: Aufgabe */}
        <div
          ref={col1Ref}
          style={{
            minWidth: 120,
            padding: 12,
            boxSizing: "border-box",
            overflow: "auto",
            borderRight: "1px solid var(--terminal-green)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            height: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "inherit",
              color: "var(--terminal-cyan)",
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            Aufgabe
          </div>
          <div
            style={{ fontFamily: "inherit", color: "var(--terminal-green)" }}
          >
            <strong>{level.name}</strong>
            <br />
            {level.tutorial}
            <br />
            <span style={{ color: "var(--terminal-yellow)" }}>
              Ziel: Erreiche das Feld ⚑
            </span>
          </div>
        </div>
        {/* Spalte 2: CodeEditor + Console (vertikal gesplittet) */}
        <div
          ref={col2Ref}
          className="code-console-split"
          style={{
            minWidth: 220,
            width: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            ref={codeRef}
            style={{
              minHeight: 80,
              height: "65%",
              padding: 8,
              boxSizing: "border-box",
              overflow: "auto",
              position: "relative",
              borderBottom: "1px solid var(--terminal-green)",
            }}
          >
            <CodeEditor value={code} onChange={setCode} />
          </div>
          <div
            ref={consoleRef}
            style={{
              minHeight: 60,
              height: "35%",
              padding: 8,
              boxSizing: "border-box",
              overflow: "auto",
              fontFamily: "inherit",
              color: "var(--terminal-green)",
              background: "var(--terminal-bg)",
            }}
          >
            <div
              style={{
                fontFamily: "inherit",
                color: "var(--terminal-cyan)",
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              Console
            </div>
            <pre
              style={{
                margin: 0,
                fontFamily: "inherit",
                color: "var(--terminal-green)",
                height: "100%",
              }}
            >
              {errors.length > 0
                ? errors
                    .map(
                      (err) => `> Fehler (Zeile ${err.line}): ${err.message}`
                    )
                    .join("\n")
                : logs.length > 0
                ? logs.join("\n")
                : "> Keine Ausgaben."}
            </pre>
          </div>
          <div
            id="run-feedback"
            style={{ minHeight: 24, textAlign: "center", fontSize: 18 }}
          ></div>
        </div>
        {/* Spalte 3: GameBoard */}
        <div
          ref={col3Ref}
          style={{
            minWidth: 180,
            padding: 12,
            boxSizing: "border-box",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GameBoard level={level} robotPosition={robotPosition!} />
          </div>
        </div>
      </div>
      <style>{`
        .gutter.gutter-horizontal {
          background: #222;
          cursor: col-resize;
          width: 12px !important;
          min-width: 12px;
          z-index: 10;
        }
        .gutter.gutter-vertical {
          background: #222;
          cursor: row-resize;
          height: 10px !important;
          min-height: 10px;
          z-index: 10;
        }
        .gutter span {
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </main>
  );
}
