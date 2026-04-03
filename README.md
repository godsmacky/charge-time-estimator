# ⚡ EV Charge Time Estimator

A responsive single-page app that estimates EV charging time and cost, built with **React + Vite + TypeScript** and deployed to **GitHub Pages**.

🔗 **Live site:** https://godsmacky.github.io/charge-time-estimator/

---

## Features

- **Inputs**
  - Battery capacity (kWh)
  - Current state of charge (SOC %)
  - Target SOC %
  - Charger power (kW) – with quick-select presets
  - Charging efficiency (%)
  - Electricity price ($/kWh)

- **Outputs**
  - Energy added to battery (kWh)
  - Energy drawn from wall (kWh)
  - Estimated charge time (hours & minutes)
  - Estimated cost ($)
  - Effective charging power (kW)

- **UX extras**
  - Charger presets: Level 1 (1.4 kW), Level 2 (7.2 kW), DC Fast 50 kW, DC Fast 150 kW
  - SOC visual progress bar
  - Shareable URL (inputs encoded as query parameters)
  - Dark mode toggle (respects system preference, toggleable)
  - Fully accessible (labels, ARIA attributes, keyboard-friendly)
  - Mobile-responsive layout

---

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/charge-time-estimator/

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Preview with:

```bash
npm run preview
```

---

## Deployment (GitHub Pages)

The app deploys automatically via GitHub Actions on every push to `main`.

### Setup (one-time)

1. In your repo settings: **Pages → Source → GitHub Actions**
2. In **Settings → Actions → General → Workflow permissions**, enable **Read and write permissions**

The workflow file is at `.github/workflows/deploy.yml`.

The Vite config sets `base: '/charge-time-estimator/'` so all asset paths resolve correctly on GitHub Pages.

---

## Calculations

| Output | Formula |
|--------|---------|
| Energy to add | `(targetSoc − currentSoc) / 100 × batteryCapacity` |
| Energy drawn from wall | `energyToAdd / (efficiency / 100)` |
| Charge time | `energyDrawn / chargerPower` |
| Cost | `energyDrawn × electricityPrice` |
| Effective power | `chargerPower × (efficiency / 100)` |
