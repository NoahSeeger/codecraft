"use client";
import { useRef, useEffect, useState } from "react";
import Split from "split.js";
import { CodeEditor } from "../../components/CodeEditor";
import { validatePseudoCode } from "../../utils/pseudocodeValidation";
import { executePseudoCode } from "../../utils/pseudocodeInterpreter";
import { GameBoard } from "../../components/GameBoard";
import { Tile } from "../../levels/levels";

const DEFAULT_GRID_SIZE = 5;

export default function CreateLevelPage() {
  const [name, setName] = useState("");
  const [tutorial, setTutorial] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [solution, setSolution] = useState("");
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [simRobot, setSimRobot] = useState<{
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
  } | null>(null);
  const [simHistory, setSimHistory] = useState<any[]>([]);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simRunning, setSimRunning] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);
  const [simError, setSimError] = useState(false);

  // Split.js Refs
  const leftRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const gridBottomRef = useRef<HTMLDivElement>(null);

  // Split.js Instanzen für Cleanup
  const splitMainRef = useRef<any>(null);
  const splitMidVertRef = useRef<any>(null);
  const splitRightVertRef = useRef<any>(null);

  useEffect(() => {
    // Hauptspalten (horizontal)
    if (leftRef.current && midRef.current && rightRef.current) {
      splitMainRef.current = Split(
        [leftRef.current, midRef.current, rightRef.current],
        {
          direction: "horizontal",
          sizes: [22, 32, 46],
          minSize: [200, 320, 320],
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
    // Vertikaler Split im Coding/Console-Bereich (Mitte)
    if (codeRef.current && consoleRef.current) {
      splitMidVertRef.current = Split([codeRef.current, consoleRef.current], {
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
    // Vertikaler Split im rechten Bereich (Grid/Simulation)
    if (gridTopRef.current && gridBottomRef.current) {
      splitRightVertRef.current = Split(
        [gridTopRef.current, gridBottomRef.current],
        {
          direction: "vertical",
          sizes: [60, 40],
          minSize: [120, 120],
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
        }
      );
    }
    // Cleanup
    return () => {
      if (splitMainRef.current && splitMainRef.current.destroy)
        splitMainRef.current.destroy();
      if (splitMidVertRef.current && splitMidVertRef.current.destroy)
        splitMidVertRef.current.destroy();
      if (splitRightVertRef.current && splitRightVertRef.current.destroy)
        splitRightVertRef.current.destroy();
    };
  }, []);

  const TILE_TYPES = [
    { type: "empty", label: "Empty", color: "#222" },
    { type: "wall", label: "Wall", color: "#888" },
    { type: "start", label: "Start", color: "#39ff14" },
    { type: "goal", label: "Goal", color: "#00fff7" },
    { type: "berry", label: "Berry", color: "#ffd600" },
  ];

  const [selectedTile, setSelectedTile] = useState("wall");
  const [grid, setGrid] = useState<Tile[][]>(
    Array.from({ length: DEFAULT_GRID_SIZE }, () =>
      Array.from({ length: DEFAULT_GRID_SIZE }, () => "empty")
    )
  );
  // Start/Goal Positionen merken
  // Start-Position speichert jetzt auch die Richtung (default: 'right')
  const [startPos, setStartPos] = useState<{
    x: number;
    y: number;
    direction: "up" | "down" | "left" | "right";
  } | null>(null);
  const [goalPos, setGoalPos] = useState<{ x: number; y: number } | null>(null);

  // Grid zurücksetzen bei Größenänderung
  useEffect(() => {
    setGrid(
      Array.from({ length: gridSize }, (_, y) =>
        Array.from({ length: gridSize }, (_, x) => {
          // Versuche Start/Goal zu erhalten, sonst leere Felder
          if (startPos && startPos.x === x && startPos.y === y) return "start";
          if (goalPos && goalPos.x === x && goalPos.y === y) return "goal";
          return "empty";
        })
      )
    );
    setStartPos(null);
    setGoalPos(null);
  }, [gridSize]);

  // Platzieren eines Tiles
  function handlePlaceTile(x: number, y: number) {
    setGrid((old) => {
      const newGrid = old.map((row) => [...row]);
      if (selectedTile === "start") {
        // Nur ein Start erlaubt
        if (startPos) newGrid[startPos.y][startPos.x] = "empty";
        newGrid[y][x] = "start";
        setStartPos({ x, y, direction: "right" }); // Richtung kann später auswählbar werden
      } else if (selectedTile === "goal") {
        // Nur ein Goal erlaubt
        if (goalPos) newGrid[goalPos.y][goalPos.x] = "empty";
        newGrid[y][x] = "goal";
        setGoalPos({ x, y });
      } else {
        // Walls, Berry, Empty
        if (newGrid[y][x] === "start") setStartPos(null);
        if (newGrid[y][x] === "goal") setGoalPos(null);
        newGrid[y][x] = selectedTile as Tile;
      }
      return newGrid;
    });
  }

  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // TestSuccess zurücksetzen, wenn relevante Werte geändert werden
  useEffect(() => {
    setTestSuccess(false);
  }, [
    solution,
    JSON.stringify(grid),
    startPos,
    goalPos,
    difficulty,
    name,
    tutorial,
  ]);

  // Level-Objekt für Testlauf bauen
  const buildLevel = () => {
    // Finde Start/Goal
    let start = startPos || { x: 0, y: 0, direction: "right" as const };
    let goal = goalPos || { x: gridSize - 1, y: gridSize - 1 };
    return {
      id: 9999,
      name: name || "Untitled",
      grid,
      start: { ...start },
      goal,
      tutorial,
      solution,
      berries: grid.flat().filter((t) => t === "berry").length,
      difficulty,
    };
  };
  // Test Solution ausführen
  async function handleTestSolution() {
    setTestRunning(true);
    setTestLogs([]);
    setTestSuccess(false);
    const level = buildLevel();
    const errors = validatePseudoCode(solution);
    if (errors.length > 0) {
      setTestLogs(
        errors.map((err) => `> Error (line ${err.line}): ${err.message}`)
      );
      setTestRunning(false);
      return;
    }
    const result = executePseudoCode(solution, level);
    const history = result.states;
    for (let i = 1; i < history.length; i++) {
      await new Promise((res) => setTimeout(res, 200));
      setTestLogs((prev) => [
        ...prev,
        `Step ${i}: (${history[i].x},${history[i].y}) ${history[i].direction}`,
      ]);
    }
    // Ziel-Check + Berries
    const last = history[history.length - 1];
    const allBerriesCollected = Object.values(result.berries).every((v) => v);
    if (
      last.x === level.goal.x &&
      last.y === level.goal.y &&
      allBerriesCollected
    ) {
      setTestLogs((prev) => [
        ...prev,
        "> Success: Goal and all berries reached!",
      ]);
      setTestSuccess(true);
    } else if (!allBerriesCollected) {
      setTestLogs((prev) => [...prev, "> Error: Not all berries collected."]);
    } else {
      setTestLogs((prev) => [...prev, "> Error: Goal not reached."]);
    }
    setTestRunning(false);
  }

  // Level speichern
  function handleSaveLevel() {
    const level = buildLevel();
    // Hole bestehende User-Levels
    let userLevels: any[] = [];
    try {
      const raw = localStorage.getItem("userLevels");
      if (raw) userLevels = JSON.parse(raw);
    } catch {}
    // Füge neues Level hinzu (mit unique id)
    const newLevel = { ...level, id: Date.now() };
    userLevels.push(newLevel);
    localStorage.setItem("userLevels", JSON.stringify(userLevels));
    setSaveSuccess(true);
  }

  // Simulation/Test Solution
  async function handleSimulate() {
    setSimRunning(true);
    setSimLogs([]);
    setSimSuccess(false);
    setSimError(false);
    setSimStep(0);
    const level = buildLevel();
    const errors = validatePseudoCode(solution);
    if (errors.length > 0) {
      setSimLogs(
        errors.map((err) => `> Error (line ${err.line}): ${err.message}`)
      );
      setSimRunning(false);
      setSimError(true);
      return;
    }
    const result = executePseudoCode(solution, level);
    setSimHistory(result.states);
    setSimRobot(result.states[0]);
    setSimStep(0);
    let logs: string[] = [];
    for (let i = 1; i < result.states.length; i++) {
      await new Promise((res) => setTimeout(res, 300));
      setSimRobot(result.states[i]);
      setSimStep(i);
      logs.push(
        `Step ${i}: (${result.states[i].x},${result.states[i].y}) ${result.states[i].direction}`
      );
      setSimLogs([...logs]);
    }
    // Ziel-Check + Berries
    const last = result.states[result.states.length - 1];
    const allBerriesCollected = Object.values(result.berries).every((v) => v);
    if (
      last.x === level.goal.x &&
      last.y === level.goal.y &&
      allBerriesCollected
    ) {
      setSimLogs((prev) => [
        ...prev,
        "> Success: Goal and all berries reached!",
      ]);
      setSimSuccess(true);
      setTestSuccess(true); // Save-Button aktivieren, wenn Simulation erfolgreich
    } else if (!allBerriesCollected) {
      setSimLogs((prev) => [...prev, "> Error: Not all berries collected."]);
      setSimError(true);
    } else {
      setSimLogs((prev) => [...prev, "> Error: Goal not reached."]);
      setSimError(true);
    }
    setSimRunning(false);
  }
  function handleSimReset() {
    setSimRobot(null);
    setSimStep(0);
    setSimLogs([]);
    setSimSuccess(false);
    setSimError(false);
    setSimHistory([]);
  }

  // Save-Button nur aktivieren, wenn alle Felder ausgefüllt und Test erfolgreich
  const saveEnabled = !!name && !!tutorial && difficulty > 0 && testSuccess;

  return (
    <main
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "var(--terminal-bg)",
        color: "var(--terminal-green)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
        padding: 16, // Seitenpadding wie in /level/[id]/page.tsx
        margin: 0,
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          fontSize: 38,
          color: "var(--terminal-cyan)",
          marginBottom: 12,
        }}
      >
        Level Creator
      </h1>
      {saveSuccess ? (
        <div
          style={{
            color: "var(--terminal-green)",
            fontSize: 24,
            background: "#181818",
            border: "2px solid var(--terminal-green)",
            borderRadius: 8,
            padding: 32,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 18 }}>Level saved successfully!</div>
          <a href="/level">
            <button
              style={{
                fontSize: 22,
                color: "var(--terminal-cyan)",
                background: "#111",
                border: "2px solid var(--terminal-cyan)",
                borderRadius: 6,
                fontWeight: "bold",
                padding: "10px 32px",
                cursor: "pointer",
                marginTop: 12,
              }}
            >
              Go to Level Select
            </button>
          </a>
        </div>
      ) : (
        <div
          style={{
            width: "100vw",
            height: "calc(100vh - 70px)",
            minHeight: 0,
            display: "flex",
            flexDirection: "row",
            border: "2px solid var(--terminal-green)",
            borderRadius: 8,
            boxShadow: "0 0 32px #000",
            background: "#181818",
            overflow: "hidden",
            padding: 10, // Seitenpadding für das Panel
          }}
        >
          {/* Links: Meta-Infos */}
          <div
            ref={leftRef}
            style={{
              minWidth: 120,
              maxWidth: "100%",
              width: "100%",
              minHeight: 0,
              height: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              overflow: "auto",
              padding: 14, // Panel-Padding
            }}
          >
            <label
              style={{ color: "var(--terminal-cyan)", fontWeight: "bold" }}
            >
              Level Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
              placeholder="e.g. Berry Collector"
            />
            <label
              style={{ color: "var(--terminal-cyan)", fontWeight: "bold" }}
            >
              Mission / Task
            </label>
            <textarea
              value={tutorial}
              onChange={(e) => setTutorial(e.target.value)}
              style={{ width: "100%", minHeight: 48, marginBottom: 8 }}
              placeholder="Describe the goal of the level..."
            />
            <label
              style={{ color: "var(--terminal-cyan)", fontWeight: "bold" }}
            >
              Difficulty
            </label>
            <div style={{ marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: 28,
                    color:
                      star <= difficulty ? "var(--terminal-yellow)" : "#333",
                    cursor: "pointer",
                    marginRight: 2,
                  }}
                  onClick={() => setDifficulty(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <button
              onClick={saveEnabled ? handleSaveLevel : undefined}
              disabled={!saveEnabled}
              style={{
                fontSize: 18,
                color: saveEnabled ? "var(--terminal-green)" : "#888",
                background: saveEnabled ? "#181" : "#222",
                border: saveEnabled
                  ? "2px solid var(--terminal-green)"
                  : "1.5px solid #333",
                borderRadius: 4,
                fontWeight: "bold",
                padding: "8px 18px",
                cursor: saveEnabled ? "pointer" : "not-allowed",
                opacity: saveEnabled ? 1 : 0.6,
                marginTop: 16,
              }}
            >
              Save Level
            </button>
            {/* Checkliste für Save-Bedingungen */}
            <div
              style={{
                marginTop: 14,
                fontSize: 15,
                color: "var(--terminal-cyan)",
                background: "#181818",
                borderRadius: 6,
                padding: 10,
                border: "1px solid #222",
                maxWidth: 320,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                Speichern möglich, wenn:
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{name ? "✔️" : "❌"}</span>
                <span>Name eingegeben</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{tutorial ? "✔️" : "❌"}</span>
                <span>Task/Mission eingegeben</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{difficulty > 0 ? "✔️" : "❌"}</span>
                <span>Difficulty gewählt</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{testSuccess ? "✔️" : "❌"}</span>
                <span>Test Solution erfolgreich</span>
              </div>
            </div>
          </div>
          {/* Mitte: Coding/Console exakt wie im Spiel */}
          <div
            ref={midRef}
            style={{
              minWidth: 220,
              maxWidth: "100%",
              width: "100%",
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderLeft: "1.5px solid #222",
              borderRight: "1.5px solid #222",
              overflow: "hidden",
              padding: 10, // Panel-Padding
            }}
          >
            <div
              ref={codeRef}
              style={{
                minHeight: 80,
                height: "65%",
                padding: 8, // Editor-Padding
                boxSizing: "border-box",
                overflow: "auto",
                borderBottom: "1px solid var(--terminal-green)",
              }}
            >
              <CodeEditor value={solution} onChange={setSolution} />
            </div>
            <div
              ref={consoleRef}
              style={{
                minHeight: 60,
                height: "35%",
                background: "#181818",
                color: simSuccess
                  ? "var(--terminal-green)"
                  : simError
                  ? "var(--terminal-red)"
                  : "var(--terminal-cyan)",
                border: "1px solid #222",
                borderRadius: 4,
                fontFamily: "inherit",
                fontSize: 15,
                margin: 0,
                padding: 10, // Console-Padding
                whiteSpace: "pre-wrap",
                overflowY: "auto",
              }}
            >
              {simLogs.length > 0
                ? simLogs.join("\n")
                : "> Console: Test your solution in the simulation panel."}
            </div>
          </div>
          {/* Rechts: Grid-Builder + Simulation (vertikal gesplittet) */}
          <div
            ref={rightRef}
            style={{
              minWidth: 180,
              maxWidth: "100%",
              width: "100%",
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              padding: 10, // Panel-Padding
            }}
          >
            <div
              ref={gridTopRef}
              style={{
                minHeight: 0,
                height: "60%",
                padding: 14, // Grid-Panel-Padding
                borderBottom: "1.5px solid #222",
                overflow: "auto",
              }}
            >
              {/* Toolbar und Grid wie gehabt */}
              <div
                style={{
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <label
                  style={{ color: "var(--terminal-cyan)", fontWeight: "bold" }}
                >
                  Grid Size
                </label>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  style={{
                    fontSize: 18,
                    background: "#111",
                    color: "var(--terminal-green)",
                    border: "1px solid var(--terminal-green)",
                    borderRadius: 4,
                  }}
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => (
                    <option key={n} value={n}>
                      {n} x {n}
                    </option>
                  ))}
                </select>
              </div>
              {/* Toolbar */}
              <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                {TILE_TYPES.map((tile) => (
                  <button
                    key={tile.type}
                    onClick={() => setSelectedTile(tile.type)}
                    style={{
                      background:
                        selectedTile === tile.type ? tile.color : "#181818",
                      color: selectedTile === tile.type ? "#111" : tile.color,
                      border:
                        selectedTile === tile.type
                          ? `2px solid var(--terminal-cyan)`
                          : "1.5px solid #333",
                      borderRadius: 6,
                      fontWeight: "bold",
                      fontSize: 16,
                      padding: "6px 14px",
                      cursor: "pointer",
                      minWidth: 60,
                      transition: "background 0.15s, color 0.15s, border 0.15s",
                    }}
                  >
                    {tile.label}
                  </button>
                ))}
              </div>
              {/* Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                  gap: 2,
                  width: "100%",
                  maxWidth: 480,
                  aspectRatio: "1/1",
                  background: "#222",
                  border: "1.5px solid #333",
                  borderRadius: 6,
                  margin: "0 auto",
                  userSelect: "none",
                }}
              >
                {grid.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={x + "," + y}
                      onClick={() => handlePlaceTile(x, y)}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: 0,
                        minWidth: 0,
                        background:
                          cell === "empty"
                            ? "#181818"
                            : cell === "wall"
                            ? "#888"
                            : cell === "start"
                            ? "#39ff14"
                            : cell === "goal"
                            ? "#00fff7"
                            : cell === "berry"
                            ? "#ffd600"
                            : "#222",
                        border:
                          cell === "start" || cell === "goal"
                            ? "2.5px solid #222"
                            : "1.5px solid #333",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: 18,
                        color:
                          cell === "start"
                            ? "#111"
                            : cell === "goal"
                            ? "#111"
                            : cell === "berry"
                            ? "#222"
                            : "#888",
                        cursor: "pointer",
                        transition: "background 0.1s, border 0.1s",
                      }}
                      title={`(${x},${y})`}
                    >
                      {cell === "start"
                        ? "S"
                        : cell === "goal"
                        ? "G"
                        : cell === "berry"
                        ? "B"
                        : ""}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div
              ref={gridBottomRef}
              style={{
                minHeight: 0,
                height: "40%",
                padding: 14, // Simulation-Panel-Padding
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "60%",
                  minHeight: 180,
                  maxHeight: 320,
                  marginBottom: 12,
                }}
              >
                {simRobot && simHistory.length > 0 ? (
                  <GameBoard level={buildLevel()} robotPosition={simRobot} />
                ) : (
                  <div
                    style={{
                      color: "#444",
                      fontSize: 22,
                      textAlign: "center",
                      marginTop: 40,
                    }}
                  >
                    [ Simulation preview will appear here ]
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                <button
                  onClick={handleSimulate}
                  disabled={simRunning}
                  style={{
                    fontSize: 18,
                    color: "var(--terminal-cyan)",
                    background: "#181818",
                    border: "1.5px solid var(--terminal-cyan)",
                    borderRadius: 4,
                    fontWeight: "bold",
                    padding: "6px 18px",
                    cursor: simRunning ? "not-allowed" : "pointer",
                  }}
                >
                  {simRunning ? "Running..." : "Test Solution"}
                </button>
                <button
                  onClick={handleSimReset}
                  disabled={simRunning}
                  style={{
                    fontSize: 18,
                    color: "var(--terminal-yellow)",
                    background: "#181818",
                    border: "1.5px solid var(--terminal-yellow)",
                    borderRadius: 4,
                    fontWeight: "bold",
                    padding: "6px 18px",
                    cursor: simRunning ? "not-allowed" : "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
              <div
                style={{
                  minHeight: 40,
                  color: simSuccess
                    ? "var(--terminal-green)"
                    : simError
                    ? "var(--terminal-red)"
                    : "var(--terminal-cyan)",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {simSuccess
                  ? "✓ Solution is valid!"
                  : simError
                  ? "✗ Solution failed."
                  : ""}
              </div>
            </div>
          </div>
        </div>
      )}
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
