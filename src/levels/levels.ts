export type Tile = "empty" | "wall" | "start" | "goal" | "berry";

export interface Level {
  id: number;
  name: string;
  grid: Tile[][];
  start: { x: number; y: number; direction: "up" | "down" | "left" | "right" };
  goal: { x: number; y: number };
  tutorial: string;
  solution: string;
  berries?: number; // Anzahl zu sammelnder Berries (optional)
}

export const SYNTAX_HELP = `
Erlaubte Befehle:

MOVE
TURN LEFT
TURN RIGHT
PICKUP

IF <BEDINGUNG>
  ...
[ELSE
  ...]
END

WHILE <BEDINGUNG>
  ...
END

Bedingungen:
  ISBLOCKED
  NOT ISBLOCKED
  GETBLOCK == berry
  GETBLOCK == free

Beispiele:
IF ISBLOCKED
  TURN RIGHT
ELSE
  MOVE
END

WHILE NOT ISBLOCKED
  MOVE
END

PICKUP
`;

export const levels: Level[] = [
  {
    id: 1,
    name: "Level 1: Berry Pickup",
    grid: [
      ["wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "berry", "goal", "wall"],
      ["wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 3, y: 1 },
    tutorial: "Sammle die Berry mit PICKUP und erreiche das Ziel.",
    solution: "MOVE\nPICKUP\nMOVE",
    berries: 1,
  },
  {
    id: 2,
    name: "Level 2: Zwei Berries",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "berry", "empty", "berry", "goal"],
      ["wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 5, y: 1 },
    tutorial: "Sammle beide Berries und erreiche das Ziel.",
    solution: "MOVE\nPICKUP\nMOVE\nMOVE\nPICKUP\nMOVE",
    berries: 2,
  },
  {
    id: 3,
    name: "Level 3: IF und Blockade",
    grid: [
      ["wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "empty", "wall", "goal"],
      ["wall", "berry", "empty", "empty", "wall"],
      ["wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 4, y: 1 },
    tutorial: "Nutze IF, um um die Wand zu kommen und die Berry zu holen.",
    solution:
      "IF ISBLOCKED\n  TURN DOWN\n  MOVE\n  PICKUP\n  TURN RIGHT\n  MOVE\nELSE\n  MOVE\nEND\nMOVE",
    berries: 1,
  },
  {
    id: 4,
    name: "Level 4: WHILE und mehrere Berries",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "berry", "berry", "berry", "goal", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 5, y: 1 },
    tutorial: "Sammle alle Berries mit einer Schleife.",
    solution: "WHILE GETBLOCK == berry\n  MOVE\n  PICKUP\nEND\nMOVE",
    berries: 3,
  },
  {
    id: 5,
    name: "Level 5: Komplexe Schleife",
    grid: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "start", "berry", "empty", "berry", "empty", "goal"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    start: { x: 1, y: 1, direction: "right" },
    goal: { x: 6, y: 1 },
    tutorial: "Sammle alle Berries, überspringe leere Felder.",
    solution:
      "WHILE NOT ISBLOCKED\n  IF GETBLOCK == berry\n    MOVE\n    PICKUP\n  ELSE\n    MOVE\n  END\nEND",
    berries: 2,
  },
];
