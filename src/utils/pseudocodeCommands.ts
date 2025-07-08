// Zentrale Definition aller Pseudo-Code-Kommandos
// Für Validation und Interpreter nutzbar

import type { RobotState } from "./pseudocodeInterpreter";
import type { Level } from "../levels/levels";

export interface PseudoCodeCommand {
  name: string;
  pattern: RegExp;
  description: string;
  example?: string;
  validate?: (args: string[]) => boolean;
  execute?: (ctx: {
    state: RobotState;
    level: Level;
    berries: { [key: string]: boolean };
    args: string[];
  }) => RobotState | void;
}

export const PSEUDOCODE_COMMANDS: PseudoCodeCommand[] = [
  {
    name: "MOVE",
    pattern: /^MOVE$/,
    description: "Bewege den Roboter ein Feld in Blickrichtung vorwärts.",
    example: "MOVE",
    execute: ({ state, level }) => {
      let { x, y, direction } = state;
      let nx = x,
        ny = y;
      if (direction === "up") ny--;
      if (direction === "down") ny++;
      if (direction === "left") nx--;
      if (direction === "right") nx++;
      if (
        level.grid[ny] &&
        level.grid[ny][nx] &&
        level.grid[ny][nx] !== "wall"
      ) {
        return { ...state, x: nx, y: ny };
      }
      return state;
    },
  },
  {
    name: "TURN LEFT",
    pattern: /^TURN LEFT$/,
    description: "Drehe den Roboter nach links.",
    example: "TURN LEFT",
    execute: ({ state }) => {
      const dirs = ["up", "right", "down", "left"];
      let idx = dirs.indexOf(state.direction);
      idx = (idx + 3) % 4;
      return { ...state, direction: dirs[idx] };
    },
  },
  {
    name: "TURN RIGHT",
    pattern: /^TURN RIGHT$/,
    description: "Drehe den Roboter nach rechts.",
    example: "TURN RIGHT",
    execute: ({ state }) => {
      const dirs = ["up", "right", "down", "left"];
      let idx = dirs.indexOf(state.direction);
      idx = (idx + 1) % 4;
      return { ...state, direction: dirs[idx] };
    },
  },
  {
    name: "PICKUP",
    pattern: /^PICKUP$/,
    description: "Sammelt eine Berry auf dem aktuellen Feld ein.",
    example: "PICKUP",
    execute: ({ state, berries }) => {
      const key = `${state.x},${state.y}`;
      if (berries[key] === false) berries[key] = true;
    },
  },
  // Kontrollstrukturen und weitere Kommandos können hier ergänzt werden
  {
    name: "IF ISBLOCKED",
    pattern: /^IF ISBLOCKED$/,
    description: "Falls das Feld vor dem Roboter blockiert ist (Wand).",
    example: "IF ISBLOCKED",
  },
  {
    name: "IF NOT ISBLOCKED",
    pattern: /^IF NOT ISBLOCKED$/,
    description: "Falls das Feld vor dem Roboter frei ist.",
    example: "IF NOT ISBLOCKED",
  },
  {
    name: "IF GETBLOCK == berry",
    pattern: /^IF GETBLOCK == berry$/,
    description: "Falls das Feld vor dem Roboter eine Berry ist.",
    example: "IF GETBLOCK == berry",
  },
  {
    name: "IF GETBLOCK == free",
    pattern: /^IF GETBLOCK == free$/,
    description: "Falls das Feld vor dem Roboter frei ist.",
    example: "IF GETBLOCK == free",
  },
  {
    name: "ELSE",
    pattern: /^ELSE$/,
    description: "Alternative Anweisungen, falls IF-Bedingung nicht zutrifft.",
    example: "ELSE",
  },
  {
    name: "END",
    pattern: /^END$/,
    description: "Beendet einen IF- oder WHILE-Block.",
    example: "END",
  },
  {
    name: "WHILE ISBLOCKED",
    pattern: /^WHILE ISBLOCKED$/,
    description: "Solange das Feld vor dem Roboter blockiert ist.",
    example: "WHILE ISBLOCKED",
  },
  {
    name: "WHILE NOT ISBLOCKED",
    pattern: /^WHILE NOT ISBLOCKED$/,
    description: "Solange das Feld vor dem Roboter frei ist.",
    example: "WHILE NOT ISBLOCKED",
  },
  {
    name: "WHILE GETBLOCK == berry",
    pattern: /^WHILE GETBLOCK == berry$/,
    description: "Solange das Feld vor dem Roboter eine Berry ist.",
    example: "WHILE GETBLOCK == berry",
  },
  {
    name: "WHILE GETBLOCK == free",
    pattern: /^WHILE GETBLOCK == free$/,
    description: "Solange das Feld vor dem Roboter frei ist.",
    example: "WHILE GETBLOCK == free",
  },
];
