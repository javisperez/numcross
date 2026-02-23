# NumCross

Infinite procedural arithmetic crossword puzzle — PWA built with React, TypeScript, Vite and Tailwind CSS.

## Play

https://javisperez.github.io/numcross

## How to play

Fill in the blank squares with the numbers from the tile bank so that every equation (horizontal and vertical) is correct. Each tile can only be used once.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## Deploy to GitHub Pages

1. In `vite.config.ts`, set `base` to `'/<YOUR_REPO_NAME>/'`
2. In `package.json`, update `homepage` field
3. Run:

```bash
npm run deploy
```

This builds the project and pushes the `dist/` folder to the `gh-pages` branch automatically.

## Install as PWA

Open the live URL on your phone and choose "Add to Home Screen" from your browser menu.

## Project structure

```
src/
  engine/         # Pure puzzle generation logic (no React)
    prng.ts       # Seeded PRNG
    arithmetic.ts # Operators, applyOp
    generator.ts  # placeSegments, solveConstraints, buildGrid
    difficulty.ts # getDiff, shapeName, generateLevel
    checker.ts    # checkLine, checkSolution logic
    scoring.ts    # computeScoreBreakdown
  store/
    useGameStore.ts  # Zustand store — all game state & actions
  components/
    Header.tsx
    Grid.tsx
    TileBank.tsx
    ActionBar.tsx
    ScoreBar.tsx
    WinModal.tsx
    Toast.tsx
  hooks/
    useKeyboard.ts  # keyboard shortcuts
    useTimer.ts     # interval timer
  App.tsx
  main.tsx
  index.css
```

## License

MIT
