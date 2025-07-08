# CodeCraft – Terminal / Hacker / ASCII UI Design

## Farbschema

- **Hintergrund:** Tiefschwarz (`#111` oder `#000`)
- **Primärfarbe:** Neongrün (`#39FF14`)
- **Sekundärfarben:** Cyan (`#00FFF7`), Rot (`#FF1744`), Gelb (`#FFD600`)
- **Text:** Immer Monospace, hohe Kontraste

## Schriftart

- **Monospace:** z.B. `Fira Mono`, `IBM Plex Mono`, `Courier New`
- **Fallback:** `monospace`

## UI-Elemente

- **ASCII-Rahmen:**
  - Blöcke und Felder werden mit ASCII-Zeichen wie `+---+`, `|   |`, `-----` umrahmt
- **Prompt-Symbole:**
  - Eingabezeile beginnt mit `>`, `$` oder `#`
- **Buttons:**
  - Als ASCII-Text, z.B. `[ RUN ]`, `[ RESET ]`
- **Status/Feedback:**
  - Terminal-Output-Stil, z.B. `> Success!`, `> Error: ...`
- **Blinkender Cursor:**
  - `█` am Ende der Eingabe oder als Animation
- **ASCII-Art:**
  - Spielfeld, Roboter, Ziel, Wände als Zeichen wie `█`, `░`, `▓`, `.`

## Animationen & Effekte

- **Blinken:**
  - Cursor oder Fehler/Erfolgsmeldungen
- **Tippen:**
  - Text kann zeichenweise erscheinen (optional)
- **Keine Maus-Interaktion nötig:**
  - Fokus auf Tastatur und Texteingabe

## Inspirationen

- Matrix UI, Hackertyper.net, htop, cmatrix, Hacknet, Uplink

## Beispiel (ASCII-Block)

```
+----------------------+
| > MOVE              |
| > TURN LEFT         |
| >                  █|
+----------------------+
```

## Umsetzungshinweise

- Verwende für alle UI-Elemente Monospace-Fonts und ASCII-Rahmen.
- Farben und Effekte konsistent im gesamten Projekt einsetzen.
- Spielfeld kann als ASCII-Grid (mit `pre` oder flexiblen Divs) oder als minimalistische Divs im Terminal-Look umgesetzt werden.
