export interface PseudoCodeError {
  line: number;
  message: string;
}

const allowedCommands = [
  /^MOVE$/,
  /^TURN (LEFT|RIGHT)$/,
  /^IF PATH AHEAD$/,
  /^WHILE PATH AHEAD$/,
  /^END$/,
];

export function validatePseudoCode(code: string): PseudoCodeError[] {
  const lines = code.split(/\r?\n/);
  const errors: PseudoCodeError[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Leere Zeile ok
    const valid = allowedCommands.some((regex) => regex.test(trimmed));
    if (!valid) {
      errors.push({
        line: idx + 1,
        message: `Ungültiger Befehl: "${trimmed}"`,
      });
    }
  });
  return errors;
}
