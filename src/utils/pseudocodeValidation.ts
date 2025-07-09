import { PSEUDOCODE_COMMANDS } from "./pseudocodeCommands";

export interface PseudoCodeError {
  line: number;
  message: string;
}

export function validatePseudoCode(code: string): PseudoCodeError[] {
  const lines = code.split(/\r?\n/).map((l) => l.replace(/\t/g, "  "));
  const errors: PseudoCodeError[] = [];
  const stack: { indent: number; type: string }[] = [];
  lines.forEach((rawLine, idx) => {
    const indent = rawLine.match(/^ */)?.[0].length || 0;
    const line = rawLine.trim();
    if (!line) return; // Leere Zeile ok
    // Kontrollstruktur?
    const isControl = /^(IF |WHILE |ELSE$)/.test(line);
    if (isControl) {
      // ELSE darf nur auf gleicher Einrückung wie das letzte IF auf gleicher Ebene stehen
      if (line.startsWith("ELSE")) {
        // Suche in den vorherigen Zeilen nach dem letzten Kontrollwort auf gleicher Einrückung
        let found = false;
        for (let prev = idx - 1; prev >= 0; prev--) {
          const prevLine = lines[prev];
          const prevIndent = prevLine.match(/^ */)?.[0].length || 0;
          const prevTrim = prevLine.trim();
          if (prevIndent === indent && prevTrim.startsWith("IF ")) {
            found = true;
            break;
          }
          // Wenn wir auf gleicher Einrückung ein anderes Kontrollwort finden, abbrechen
          if (prevIndent === indent && /^(ELSE|WHILE )/.test(prevTrim)) break;
        }
        if (!found) {
          errors.push({
            line: idx + 1,
            message:
              "ELSE muss auf gleicher Einrückung wie zugehöriges IF stehen.",
          });
        }
      }
      stack.push({
        indent,
        type: line.startsWith("ELSE") ? "ELSE" : line.split(" ")[0],
      });
    } else {
      // Normales Kommando
      const valid = PSEUDOCODE_COMMANDS.some((cmd) => cmd.pattern.test(line));
      if (!valid) {
        errors.push({ line: idx + 1, message: `Ungültiger Befehl: "${line}"` });
      }
      // Muss eingerückt sein, wenn in Block
      if (stack.length > 0) {
        const last = stack[stack.length - 1];
        if (indent <= last.indent) {
          errors.push({
            line: idx + 1,
            message: "Befehle in Blöcken müssen eingerückt sein (2 Spaces).",
          });
        }
      }
    }
    // Stack zurücksetzen, wenn Einrückung sinkt
    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
  });
  return errors;
}
