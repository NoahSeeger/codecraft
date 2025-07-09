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
  // Zeilen mit Einrückung erhalten
  const lines = code.split(/\r?\n/).map((l) => l.replace(/\t/g, "  "));
  let state: RobotState = { ...level.start };
  let berries: { [key: string]: boolean } = {};
  level.grid.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile === "berry") berries[`${x},${y}`] = false;
    })
  );
  const history: RobotState[] = [state];

  // Hilfsfunktion: Finde Block (alle eingerückten Zeilen unterhalb startIdx)
  function getBlock(
    startIdx: number,
    baseIndent: number
  ): { start: number; end: number } {
    let end = startIdx + 1;
    while (end < lines.length) {
      const indent = lines[end].match(/^ */)?.[0].length || 0;
      if (lines[end].trim() === "" || indent > baseIndent) {
        end++;
      } else {
        break;
      }
    }
    return { start: startIdx + 1, end };
  }

  // Interpreter-Loop
  function runBlock(start: number, end: number) {
    let i = start;
    while (i < end) {
      const rawLine = lines[i];
      if (!rawLine.trim()) {
        i++;
        continue;
      }
      const indent = rawLine.match(/^ */)?.[0].length || 0;
      const line = rawLine.trim();
      // IF
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
        // Block finden
        const { start: blockStart, end: blockEnd } = getBlock(i, indent);
        // Suche nach ELSE auf gleicher Einrückung
        let elseIdx = -1;
        for (let j = blockStart; j < blockEnd; j++) {
          const l = lines[j];
          if (
            l.trim().startsWith("ELSE") &&
            (l.match(/^ */)?.[0].length || 0) === indent
          ) {
            elseIdx = j;
            break;
          }
        }
        if (cond) {
          // IF-Block ausführen
          if (elseIdx === -1) {
            runBlock(blockStart, blockEnd);
          } else {
            runBlock(blockStart, elseIdx);
          }
        } else if (elseIdx !== -1) {
          // ELSE-Block ausführen
          const { start: elseBlockStart, end: elseBlockEnd } = getBlock(
            elseIdx,
            indent
          );
          runBlock(elseBlockStart, elseBlockEnd);
        }
        // Nach dem gesamten IF/ELSE-Block weitermachen
        i = blockEnd;
        continue;
      }
      // ELSE (wird im IF behandelt)
      if (line.startsWith("ELSE")) {
        // Wird im IF behandelt, einfach überspringen
        i++;
        continue;
      }
      // WHILE
      if (line.startsWith("WHILE ")) {
        const { start: blockStart, end: blockEnd } = getBlock(i, indent);
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
        while (cond) {
          runBlock(blockStart, blockEnd);
          // Nach jedem Block-Durchlauf aktuellen state übernehmen
          // Bedingung nach jedem Durchlauf neu prüfen
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
        }
        i = blockEnd;
        continue;
      }
      // Normale Kommandos
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
  runBlock(0, lines.length);
  return { states: history, berries };
}
