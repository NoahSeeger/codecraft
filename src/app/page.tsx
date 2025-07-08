"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        height: "100vh",
        background: "var(--terminal-bg)",
      }}
    >
      <h1
        style={{
          color: "var(--terminal-green)",
          fontFamily: "inherit",
          fontSize: 48,
          marginBottom: 32,
          textShadow: "0 0 8px #39ff14, 0 0 2px #39ff14",
        }}
      >
        CodeCraft
      </h1>
      <p
        style={{
          color: "var(--terminal-cyan)",
          fontSize: 22,
          marginBottom: 40,
          textAlign: "center",
          maxWidth: 600,
        }}
      >
        Willkommen bei CodeCraft!
        <br />
        Löse knifflige Pseudo-Code-Puzzles, sammle Berries und lerne
        Programmierlogik im Hacker-Style.
      </p>
      <Link href="/level">
        <button
          style={{
            fontSize: 28,
            padding: "18px 48px",
            color: "var(--terminal-green)",
            background: "#181818",
            border: "2px solid var(--terminal-green)",
            borderRadius: 8,
            fontWeight: "bold",
            boxShadow: "0 0 16px #111",
            cursor: "pointer",
            marginBottom: 24,
          }}
        >
          [ Level auswählen ]
        </button>
      </Link>
      <div
        style={{ color: "var(--terminal-yellow)", marginTop: 32, fontSize: 16 }}
      >
        <span style={{ color: "var(--terminal-cyan)" }}>Tipp:</span> Fortschritt
        und Lösungen werden lokal gespeichert.
      </div>
    </main>
  );
}
