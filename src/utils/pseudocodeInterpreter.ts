import type { Level } from "../levels/levels";

export type Direction = "up" | "down" | "left" | "right";
export interface RobotState {
  x: number;
  y: number;
  direction: Direction;
}

function turn(direction: Direction, turnDir: "LEFT" | "RIGHT"): Direction {
  const dirs: Direction[] = ["up", "right", "down", "left"];
  let idx = dirs.indexOf(direction);
  if (turnDir === "LEFT") idx = (idx + 3) % 4;
  else idx = (idx + 1) % 4;
  return dirs[idx];
}

function move(state: RobotState, grid: Level["grid"]): RobotState {
  let { x, y, direction } = state;
  let nx = x,
    ny = y;
  if (direction === "up") ny--;
  if (direction === "down") ny++;
  if (direction === "left") nx--;
  if (direction === "right") nx++;
  if (grid[ny] && grid[ny][nx] && grid[ny][nx] !== "wall") {
    return { x: nx, y: ny, direction };
  }
  return state; // Blockiert
}

export function executePseudoCode(code: string, level: Level): RobotState[] {
  const lines = code
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let state: RobotState = { ...level.start };
  const history: RobotState[] = [state];
  for (const line of lines) {
    if (line === "MOVE") {
      state = move(state, level.grid);
      history.push(state);
    } else if (line === "TURN LEFT") {
      state = { ...state, direction: turn(state.direction, "LEFT") };
      history.push(state);
    } else if (line === "TURN RIGHT") {
      state = { ...state, direction: turn(state.direction, "RIGHT") };
      history.push(state);
    }
    // IF/WHILE werden später ergänzt
  }
  return history;
}
