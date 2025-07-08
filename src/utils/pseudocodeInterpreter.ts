import type { Level, Tile } from "../levels/levels";
import { PSEUDOCODE_COMMANDS } from "./pseudocodeCommands";

export type Direction = "up" | "down" | "left" | "right";
export interface RobotState {
  x: number;
  y: number;
  direction: Direction;
}

export interface InterpreterResult {
  states: RobotState[];
  berries: { [key: string]: boolean };
}

function getBlockAhead(
  state: RobotState,
  grid: Level["grid"]
): Tile | undefined {
  let { x, y, direction } = state;
  let nx = x,
    ny = y;
  if (direction === "up") ny--;
  if (direction === "down") ny++;
  if (direction === "left") nx--;
  if (direction === "right") nx++;
  return grid[ny]?.[nx];
}

export function executePseudoCode(
  code: string,
  level: Level
): InterpreterResult {
  const lines = code
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let state: RobotState = { ...level.start };
  let berries: { [key: string]: boolean } = {};
  // Markiere alle Berries als nicht eingesammelt
  level.grid.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile === "berry") berries[`${x},${y}`] = false;
    })
  );
  const history: RobotState[] = [state];
  let i = 0;
  const stack: number[] = [];
  while (i < lines.length) {
    const line = lines[i];
    // Kontrollstrukturen (IF, ELSE, END, WHILE) speziell behandeln
    if (line.startsWith("IF ")) {
      let cond = false;
      if (line === "IF ISBLOCKED") {
        cond = getBlockAhead(state, level.grid) === "wall";
      } else if (line === "IF NOT ISBLOCKED") {
        cond = getBlockAhead(state, level.grid) !== "wall";
      } else if (line === "IF GETBLOCK == berry") {
        cond = getBlockAhead(state, level.grid) === "berry";
      } else if (line === "IF GETBLOCK == free") {
        cond =
          getBlockAhead(state, level.grid) === "empty" ||
          getBlockAhead(state, level.grid) === "start";
      }
      // Suche zugehöriges ELSE/END
      let elseIdx = -1,
        endIdx = -1;
      for (let j = i + 1, depth = 1; j < lines.length; j++) {
        if (lines[j].startsWith("IF ")) depth++;
        if (lines[j] === "END") {
          depth--;
          if (depth === 0) {
            endIdx = j;
            break;
          }
        }
        if (lines[j] === "ELSE" && depth === 1) elseIdx = j;
      }
      if (cond) {
        i++;
      } else if (elseIdx !== -1) {
        i = elseIdx + 1;
      } else {
        i = endIdx + 1;
      }
      stack.push(endIdx);
    } else if (line === "ELSE") {
      // Springe zum zugehörigen END
      i = stack.pop()! + 1;
    } else if (line === "END") {
      i++;
    } else if (line.startsWith("WHILE ")) {
      let cond = false;
      if (line === "WHILE ISBLOCKED") {
        cond = getBlockAhead(state, level.grid) === "wall";
      } else if (line === "WHILE NOT ISBLOCKED") {
        cond = getBlockAhead(state, level.grid) !== "wall";
      } else if (line === "WHILE GETBLOCK == berry") {
        cond = getBlockAhead(state, level.grid) === "berry";
      } else if (line === "WHILE GETBLOCK == free") {
        cond =
          getBlockAhead(state, level.grid) === "empty" ||
          getBlockAhead(state, level.grid) === "start";
      }
      // Suche zugehöriges END
      let endIdx = -1;
      for (let j = i + 1, depth = 1; j < lines.length; j++) {
        if (lines[j].startsWith("WHILE ")) depth++;
        if (lines[j] === "END") {
          depth--;
          if (depth === 0) {
            endIdx = j;
            break;
          }
        }
      }
      if (cond) {
        i++;
        stack.push(i - 1); // Merke WHILE-Start
      } else {
        i = endIdx + 1;
      }
    } else {
      // Normale Kommandos: Finde passendes Kommando in der Liste
      const cmd = PSEUDOCODE_COMMANDS.find((c) => c.pattern.test(line));
      if (cmd && cmd.execute) {
        const newState = cmd.execute({
          state,
          level,
          berries,
          args: [],
        });
        if (newState) {
          state = newState;
          history.push(state);
        }
      }
      i++;
    }
  }
  return { states: history, berries };
}
