# Trade Helpers PWA

A modern, high-performance Progressive Web Application (PWA) built with **React 18**, **TypeScript**, and **Tailwind CSS v4**. Trade Helpers provides premium utility tools for options traders to plan exits, manage risk, and journal setups with precision.

## Key Features

### 1. Target Exit Calculator
A sophisticated mathematical engine for determining optimal exit prices for NIFTY/SENSEX options.
- **Dynamic Delta Estimation**: Automatically calculates average Delta based on both entry and target spot levels to estimate premium movement accurately.
- **Time Decay (Theta) Models**:
  - **Intraday**: Applies a ~4% theta decay simulation.
  - **Overnight**: Applies a ~8% theta decay simulation to account for time risk.
- **Volatility (IV) Scenarios**:
  - **Conservative**: Simulates a 10% IV crush (common after sharp moves).
  - **Base Case**: Neutral IV environment.
  - **Optimistic**: Simulates a 12% IV expansion with reduced theta decay.
- **Intrinsic Verification**: Ensures all projections respect the option's intrinsic value at the target spot.

### 2. Strategic Stop-Loss Configuration
Robust risk management with four distinct SL protocols:
- **% of Premium**: Standard percentage-based exit.
- **Points Based**: Fixed point drop from entry price.
- **Spot Level Based**: Exits when the underlying index hits a specific price (calculates estimated premium using a 0.45 delta approximation).
- **Fixed Premium**: Hard exit at a specific premium value.
- **Risk Metrics**: Real-time calculation of **Total Capital Risk** and **Risk/Reward Ratio**.

### 3. Trade Journaling System
- **Snapshot Logic**: Save complete calculator states (including all inputs and SL parameters) with a single click.
- **Export/Import JSON**: Move your data between devices or keep offline backups.
  - **Backup JSON**: Downloads a timestamped `.json` file containing your entire journal history.
  - **Restore JSON**: Overwrites the current session with a previously saved backup file.
- **UID Tracking**: Every saved setup is assigned a unique ID and ISO timestamp.
- **Smart Persistence**: Utilizes custom React hooks linked to browser `localStorage` to ensure your data stays on your device across sessions.

### 4. Premium PWA Architecture
- **Glassmorphism UI**: High-end aesthetic using `backdrop-blur` and translucent layers.
- **Offline Reliability**: Powered by `vite-plugin-pwa` and Service Workers for near-instant loads and offline access.
- **Fully Responsive**: Tailored for both mobile-first on-field trading and desktop research.

## Project Structure

```bash
trade-helpers/
├── src/
│   ├── components/       # Reusable React components (Calculator, Journal, etc.)
│   ├── hooks/            # Custom hooks for LocalStorage and Trade History
│   ├── lib/              # Core mathematical logic (calculations.ts)
│   └── main.tsx          # App entry point
├── public/               # Static assets and PWA icons
├── vite.config.ts        # PWA and Build configuration
└── README.md             # This documentation
```

## Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

## Disclaimer

This software is for **educational and informational purposes only**. Trading involves significant risk. This tool does not provide financial advice or execute trades. Always verify calculations and consult with a certified financial advisor before making investment decisions.
