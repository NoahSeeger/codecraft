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
