export type Tile = "empty" | "wall" | "start" | "goal";

export interface Level {
  id: number;
  name: string;
  grid: Tile[][];
  start: { x: number; y: number; direction: "up" | "down" | "left" | "right" };
  goal: { x: number; y: number };
  tutorial: string;
}

export const levels: Level[] = [
  {
    id: 1,
    name: "Level 1: Geradeaus",
    grid: [
      ["wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "goal", "wall"],
      ["wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 3, y: 1 },
    tutorial: "Bewege den Roboter mit MOVE zum Ziel.",
  },
  {
    id: 2,
    name: "Level 2: Um die Ecke",
    grid: [
      ["wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "empty", "wall"],
      ["wall", "wall", "empty", "goal", "wall"],
      ["wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 3, y: 2 },
    tutorial: "Nutze MOVE und TURN, um um die Ecke zu gehen.",
  },
  {
    id: 3,
    name: "Level 3: Hindernis",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "wall", "goal", "wall"],
      ["wall", "empty", "empty", "wall", "empty", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 4, y: 1 },
    tutorial: "Weiche dem Hindernis mit TURN und MOVE aus.",
  },
  {
    id: 4,
    name: "Level 4: Bedingung",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "wall", "goal", "wall"],
      ["wall", "empty", "empty", "empty", "empty", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 4, y: 1 },
    tutorial: "Nutze IF, um zu prüfen, ob ein Weg frei ist.",
  },
  {
    id: 5,
    name: "Level 5: Schleife",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "empty", "empty", "goal", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 5, y: 1 },
    tutorial: "Nutze WHILE, um dich mehrfach zu bewegen.",
  },
];
