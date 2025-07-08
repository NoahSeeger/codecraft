"use client";

import { GameBoard } from "../components/GameBoard";
import { levels, SYNTAX_HELP } from "../levels/levels";
import { CodeEditor } from "../components/CodeEditor";
import React, { useState, useRef, useEffect } from "react";
import { validatePseudoCode } from "../utils/pseudocodeValidation";
import { executePseudoCode, RobotState } from "../utils/pseudocodeInterpreter";
import Split from "split.js";
import { PSEUDOCODE_COMMANDS } from "../utils/pseudocodeCommands";

export default function Home() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = levels[levelIndex];
  const [code, setCode] = useState("");
  const errors = validatePseudoCode(code);
  const [robotPosition, setRobotPosition] = useState(level.start);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showSyntax, setShowSyntax] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);

  // Split.js Refs
  const col1Ref = useRef<HTMLDivElement>(null); // Aufgabe
  const col2Ref = useRef<HTMLDivElement>(null); // Code+Console
  const col3Ref = useRef<HTMLDivElement>(null); // GameBoard
  const codeRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

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
    // Vertikaler Split für Code/Console mit echten Refs
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

  // Reset, wenn Level gewechselt wird
  useEffect(() => {
    setCode("");
    setRobotPosition(level.start);
    setLogs([]);
    setLevelCompleted(false);
  }, [levelIndex]);

  const handleRun = async () => {
    if (errors.length > 0) return;
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
    // Feedback für Nutzer
    const feedbackDiv = document.getElementById("run-feedback");
    if (feedbackDiv) {
      feedbackDiv.textContent = success
        ? "✔️ Richtig! Level geschafft."
        : "❌ Falsch! Versuche es erneut.";
      feedbackDiv.style.color = success
        ? "var(--terminal-green)"
        : "var(--terminal-red)";
      feedbackDiv.style.fontWeight = "bold";
      feedbackDiv.style.marginTop = "8px";
      setTimeout(() => {
        feedbackDiv.textContent = "";
      }, 2000);
    }
  };

  const handleReset = () => {
    setRobotPosition(level.start);
    setIsRunning(false);
    setLogs([]);
    setLevelCompleted(false);
  };

  const handleNext = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex(levelIndex + 1);
    }
  };

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
        <h1 style={{ flex: 1, textAlign: "center" }}>
          CodeCraft – Pseudo-Code Puzzle Game
        </h1>
        <button
          onClick={() => setShowSyntax(true)}
          style={{
            color: "var(--terminal-cyan)",
            fontWeight: "bold",
            fontSize: 18,
            marginLeft: 16,
            border: "1px solid var(--terminal-cyan)",
            background: "var(--terminal-bg)",
            padding: "4px 16px",
            borderRadius: 4,
          }}
        >
          [ SYNTAX ]
        </button>
      </div>
      {showSyntax && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10,20,10,0.92)",
            zIndex: 1000,
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
              width: "70vw",
              height: "50vh",
              maxWidth: 900,
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
                fontSize: 20,
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
                fontSize: 18,
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
          <div style={{ margin: "16px 0 8px 0", width: "100%" }}>
            <label
              style={{
                color: "var(--terminal-cyan)",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Level wählen:
            </label>
            <select
              value={levelIndex}
              onChange={(e) => setLevelIndex(Number(e.target.value))}
              style={{
                width: "100%",
                background: "var(--terminal-bg)",
                color: "var(--terminal-green)",
                border: "1px solid var(--terminal-green)",
                fontFamily: "inherit",
                fontSize: 16,
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              {levels.map((lvl, idx) => (
                <option key={lvl.id} value={idx}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "var(--terminal-cyan)" }}>{">"}</span>
            <button
              onClick={handleRun}
              disabled={isRunning || errors.length > 0}
              style={{}}
            >
              [ RUN ]
            </button>
            <button onClick={handleReset} disabled={isRunning}>
              [ RESET ]
            </button>
            {levelCompleted && levelIndex < levels.length - 1 && (
              <button
                onClick={handleNext}
                style={{ color: "var(--terminal-yellow)" }}
              >
                [ NEXT ]
              </button>
            )}
            <button
              onClick={() => setShowSolutionConfirm(true)}
              style={{ color: "var(--terminal-red)" }}
            >
              [ LÖSUNG ]
            </button>
          </div>
          {showSyntax && (
            <pre
              style={{
                marginTop: 12,
                background: "#181818",
                color: "var(--terminal-green)",
                border: "1px solid var(--terminal-green)",
                padding: 8,
                borderRadius: 4,
                fontSize: 15,
                whiteSpace: "pre-wrap",
                maxWidth: 320,
              }}
            >
              {level.syntax}
            </pre>
          )}
          {showSolutionConfirm && (
            <div
              style={{
                marginTop: 12,
                background: "#181818",
                color: "var(--terminal-yellow)",
                border: "1px solid var(--terminal-yellow)",
                padding: 8,
                borderRadius: 4,
                fontSize: 15,
                maxWidth: 320,
              }}
            >
              <div>
                Bist du sicher? Die Lösung wird deinen aktuellen Code ersetzen.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setCode(level.solution);
                    setShowSolutionConfirm(false);
                  }}
                  style={{ color: "var(--terminal-green)" }}
                >
                  [ Ja, Lösung anzeigen ]
                </button>
                <button
                  onClick={() => setShowSolutionConfirm(false)}
                  style={{ color: "var(--terminal-red)" }}
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
            <GameBoard level={level} robotPosition={robotPosition} />
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
