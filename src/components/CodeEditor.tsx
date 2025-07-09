import React, { useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const LINE_HEIGHT = 22;
const FONT_SIZE = 16;

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split(/\r?\n/);
  const lineCount = Math.max(8, lines.length);

  // Handler für Tab, Shift+Tab, Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    // Tab: 2 Spaces einfügen
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      onChange(before + "  " + after);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
      }, 0);
    }
    // Shift+Tab: 2 Spaces am Zeilenanfang entfernen
    else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
      if (value.slice(start, start + 2) === "  ") {
        onChange(value.slice(0, start) + value.slice(start + 2));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 2;
        }, 0);
      }
    }
    // Enter: Einrückung übernehmen oder automatisch erhöhen nach IF/WHILE/ELSE
    else if (e.key === "Enter") {
      const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const line = value.slice(start, selectionStart);
      const indent = line.match(/^ */)?.[0] || "";
      const trimmed = line.trim();
      // Nach IF/WHILE/ELSE automatisch +2 Spaces
      const shouldIndent = /^(IF |WHILE |ELSE$)/.test(trimmed);
      const newIndent = shouldIndent ? indent + "  " : indent;
      e.preventDefault();
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      onChange(before + "\n" + newIndent + after);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          selectionStart + 1 + newIndent.length;
      }, 0);
    }
    // Backspace am Zeilenanfang: Einrückung auf vorheriges Blockniveau reduzieren
    else if (e.key === "Backspace") {
      const start = value.lastIndexOf("\n", selectionStart - 1) + 1;
      if (selectionStart === selectionEnd && selectionStart === start) {
        // Am Zeilenanfang: Reduziere Einrückung um 2 Spaces, falls vorhanden
        const prevLineStart = value.lastIndexOf("\n", start - 2) + 1;
        const prevLine = value.slice(prevLineStart, start - 1);
        const prevIndent = prevLine.match(/^ */)?.[0] || "";
        if (
          prevIndent.length < (value.slice(start, start + 2) === "  " ? 2 : 0)
        )
          return;
        if (value.slice(start, start + 2) === "  ") {
          e.preventDefault();
          onChange(value.slice(0, start) + value.slice(start + 2));
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart;
          }, 0);
        }
      }
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.5em 1.5em 1fr",
          width: "100%",
          height: "100%",
          minHeight: 0,
          minWidth: 0,
          fontFamily: "inherit",
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_HEIGHT}px`,
          color: "var(--terminal-green)",
          background: "var(--terminal-bg)",
        }}
      >
        {/* Zeilennummern */}
        <div
          style={{
            gridColumn: 1,
            gridRow: `1 / span ${lineCount}`,
            textAlign: "right",
            color: "var(--terminal-cyan)",
            userSelect: "none",
            paddingTop: 0,
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              style={{ height: LINE_HEIGHT, lineHeight: `${LINE_HEIGHT}px` }}
            >
              {String(i + 1).padStart(2, " ")}
            </div>
          ))}
        </div>
        {/* Prompts */}
        <div
          style={{
            gridColumn: 2,
            gridRow: `1 / span ${lineCount}`,
            textAlign: "right",
            color: "var(--terminal-cyan)",
            userSelect: "none",
            paddingTop: 0,
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              style={{ height: LINE_HEIGHT, lineHeight: `${LINE_HEIGHT}px` }}
            >
              {">"}
            </div>
          ))}
        </div>
        {/* Code/Textarea */}
        <div
          style={{
            gridColumn: 3,
            gridRow: `1 / span ${lineCount}`,
            position: "relative",
            minHeight: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            id="pseudo-code"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={lineCount}
            style={{
              fontFamily: "inherit",
              fontSize: FONT_SIZE,
              background: "transparent",
              color: "var(--terminal-green)",
              border: "none",
              outline: "none",
              resize: "none",
              width: "100%",
              height: `${lineCount * LINE_HEIGHT}px`,
              lineHeight: `${LINE_HEIGHT}px`,
              boxSizing: "border-box",
              caretColor: "var(--terminal-green)",
              zIndex: 2,
              position: "absolute",
              left: 0,
              top: 0,
              minHeight: 0,
              padding: 0,
            }}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
