import { PSEUDOCODE_COMMANDS } from "./pseudocodeCommands";

export interface PseudoCodeError {
  line: number;
  message: string;
}

export function validatePseudoCode(code: string): PseudoCodeError[] {
  const lines = code.split(/\r?\n/);
  const errors: PseudoCodeError[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return; // Leere Zeile ok
    const valid = PSEUDOCODE_COMMANDS.some((cmd) => cmd.pattern.test(trimmed));
    if (!valid) {
      errors.push({
        line: idx + 1,
        message: `Ungültiger Befehl: "${trimmed}"`,
      });
    }
  });
  return errors;
}
