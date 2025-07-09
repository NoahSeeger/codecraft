"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { levels } from "../../../levels/levels";
import { GameBoard } from "../../../components/GameBoard";
import { CodeEditor } from "../../../components/CodeEditor";
import { validatePseudoCode } from "../../../utils/pseudocodeValidation";
import { executePseudoCode } from "../../../utils/pseudocodeInterpreter";
import Split from "split.js";
import { PSEUDOCODE_COMMANDS } from "../../../utils/pseudocodeCommands";

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
  const [showSyntax, setShowSyntax] = useState(false);
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
    // Nur einmal horizontale Split-Initialisierung für die drei Spalten
    let splitInstance: any;
    if (col1Ref.current && col2Ref.current && col3Ref.current) {
      splitInstance = Split(
        [col1Ref.current, col2Ref.current, col3Ref.current],
        {
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
        }
      );
    }
    // Vertikaler Split NUR innerhalb von col2Ref
    let splitVert: any;
    if (codeRef.current && consoleRef.current) {
      splitVert = Split([codeRef.current, consoleRef.current], {
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
    return () => {
      // Clean up Split.js instances
      if (splitInstance && splitInstance.destroy) splitInstance.destroy();
      if (splitVert && splitVert.destroy) splitVert.destroy();
    };
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
          gap: 0,
          minHeight: 56,
        }}
      >
        {/* Zurück-Button links */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <button
            onClick={() => router.push("/level")}
            style={{
              color: "var(--terminal-cyan)",
              background: "none",
              border: "1px solid var(--terminal-cyan)",
              borderRadius: 4,
              padding: "4px 16px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
          >
            [ Zurück zur Auswahl ]
          </button>
        </div>
        {/* Levelname und Schwierigkeit zentriert */}
        <div style={{ flex: 2, textAlign: "center" }}>
          <span
            style={{
              color: "var(--terminal-green)",
              fontSize: 26,
              fontWeight: "bold",
              letterSpacing: 1,
            }}
          >
            {level.name}
          </span>
          {levelCompleted && (
            <span
              style={{
                color: "var(--terminal-green)",
                fontSize: 22,
                marginLeft: 8,
              }}
            >
              ✔️
            </span>
          )}
          <span
            style={{
              color: "var(--terminal-yellow)",
              fontSize: 20,
              marginLeft: 16,
            }}
          >
            {"★".repeat(level.difficulty)}
            {"☆".repeat(5 - level.difficulty)}
          </span>
        </div>
        {/* ?-Button rechts */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setShowSyntax(true)}
            title="Syntax-Hilfe anzeigen"
            style={{
              color: "var(--terminal-cyan)",
              background: "none",
              border: "1.5px solid var(--terminal-cyan)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              fontWeight: "bold",
              fontSize: 22,
              marginRight: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px #00fff766",
            }}
          >
            ?
          </button>
        </div>
      </div>
      {/* Syntax-Hilfe Overlay */}
      {showSyntax && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10,20,10,0.92)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowSyntax(false)}
        >
          <div
            style={{
              background: "#181818",
              color: "var(--terminal-green)",
              border: "2px solid var(--terminal-cyan)",
              borderRadius: 8,
              padding: 32,
              width: "80vw",
              maxWidth: 700,
              maxHeight: "80vh",
              boxShadow: "0 0 32px #000",
              fontFamily: "inherit",
              fontSize: 16,
              whiteSpace: "pre-wrap",
              position: "relative",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontWeight: "bold",
                color: "var(--terminal-cyan)",
                fontSize: 22,
                marginBottom: 12,
              }}
            >
              Pseudo-Code Syntax
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {PSEUDOCODE_COMMANDS.map((cmd) => (
                <div
                  key={cmd.name}
                  style={{
                    marginBottom: 14,
                    padding: "8px 0 8px 0",
                    borderBottom: "1px solid #222",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      color: "var(--terminal-green)",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {cmd.example ? (
                      <span style={{ color: "var(--terminal-cyan)" }}>
                        {cmd.example}
                      </span>
                    ) : (
                      cmd.name
                    )}
                  </div>
                  <div
                    style={{
                      color: "var(--terminal-green)",
                      fontSize: 15,
                      marginTop: 2,
                    }}
                  >
                    {cmd.description}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSyntax(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                color: "var(--terminal-red)",
                background: "none",
                border: "none",
                fontWeight: "bold",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              [ X ]
            </button>
          </div>
        </div>
      )}
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
          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 16,
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "center",
              minHeight: 44,
            }}
          >
            <span style={{ color: "var(--terminal-cyan)", minWidth: 18 }}>
              {">"}
            </span>
            <button
              onClick={handleRun}
              disabled={isRunning || errors.length > 0}
              style={{
                color: "var(--terminal-green)",
                fontWeight: "bold",
                padding: "6px 18px",
                fontSize: 17,
                border: "2px solid var(--terminal-green)",
                background: "#181818",
                borderRadius: 5,
                minWidth: 80,
                margin: 0,
                flex: "0 1 auto",
                whiteSpace: "nowrap",
              }}
            >
              [ RUN ]
            </button>
            <button
              onClick={handleReset}
              disabled={isRunning}
              style={{
                color: "var(--terminal-green)",
                fontWeight: "bold",
                padding: "6px 18px",
                fontSize: 17,
                border: "2px solid var(--terminal-green)",
                background: "#181818",
                borderRadius: 5,
                minWidth: 80,
                margin: 0,
                flex: "0 1 auto",
                whiteSpace: "nowrap",
              }}
            >
              [ RESET ]
            </button>
            {levelCompleted && id < levels.length && (
              <button
                onClick={() => router.push(`/level/${id + 1}`)}
                style={{
                  color: "var(--terminal-yellow)",
                  fontWeight: "bold",
                  padding: "6px 18px",
                  fontSize: 17,
                  border: "2px solid var(--terminal-yellow)",
                  background: "#181818",
                  borderRadius: 5,
                  minWidth: 80,
                  margin: 0,
                  flex: "0 1 auto",
                  whiteSpace: "nowrap",
                }}
              >
                [ NEXT ]
              </button>
            )}
            <button
              onClick={() => setShowSolutionConfirm(true)}
              style={{
                color: "var(--terminal-red)",
                fontWeight: "bold",
                padding: "6px 18px",
                fontSize: 17,
                border: "2px solid var(--terminal-red)",
                background: "#181818",
                borderRadius: 5,
                minWidth: 80,
                margin: 0,
                flex: "0 1 auto",
                whiteSpace: "nowrap",
              }}
            >
              [ LÖSUNG ]
            </button>
          </div>
          {showSolutionConfirm && (
            <div
              style={{
                marginTop: 16,
                background: "#181818",
                color: "var(--terminal-yellow)",
                border: "2px solid var(--terminal-cyan)",
                borderRadius: 8,
                padding: 18,
                fontSize: 15,
                maxWidth: 340,
                width: "100%",
                boxShadow: "0 0 12px #000",
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "var(--terminal-cyan)",
                  fontSize: 17,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                Lösung für dieses Level
              </div>
              <pre
                style={{
                  color: "var(--terminal-green)",
                  fontSize: 15,
                  margin: 0,
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                {level.solution}
              </pre>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 12,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => {
                    setCode(level.solution);
                    setShowSolutionConfirm(false);
                  }}
                  style={{
                    color: "var(--terminal-green)",
                    fontWeight: "bold",
                    border: "2px solid var(--terminal-green)",
                    background: "#181818",
                    borderRadius: 5,
                    padding: "6px 18px",
                    fontSize: 15,
                  }}
                >
                  [ Ja, Lösung einfügen ]
                </button>
                <button
                  onClick={() => setShowSolutionConfirm(false)}
                  style={{
                    color: "var(--terminal-red)",
                    fontWeight: "bold",
                    border: "2px solid var(--terminal-red)",
                    background: "#181818",
                    borderRadius: 5,
                    padding: "6px 18px",
                    fontSize: 15,
                  }}
                >
                  [ Abbrechen ]
                </button>
              </div>
            </div>
          )}
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
          background: #181818;
          cursor: col-resize;
          width: 10px !important;
          min-width: 10px;
          z-index: 10;
          box-shadow: 0 0 6px #39ff1444;
          border-left: 1px solid #222;
          border-right: 1px solid #222;
          transition: background 0.2s;
        }
        .gutter.gutter-horizontal:hover {
          background: #232323;
          box-shadow: 0 0 12px #39ff1488;
        }
        .gutter.gutter-vertical {
          background: #181818;
          cursor: row-resize;
          height: 8px !important;
          min-height: 8px;
          z-index: 10;
          box-shadow: 0 0 6px #39ff1444;
          border-top: 1px solid #222;
          border-bottom: 1px solid #222;
          transition: background 0.2s;
        }
        .gutter.gutter-vertical:hover {
          background: #232323;
          box-shadow: 0 0 12px #39ff1488;
        }
        .gutter span {
          display: none;
        }
      `}</style>
    </main>
  );
}
