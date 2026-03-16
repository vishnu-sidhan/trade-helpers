# Trade Helpers

A collection of trading tools and calculators to assist with options trading decisions.

## Overview

Trade Helpers is a multi-application platform featuring various trading calculators and tools. The main hub provides easy access to all available tools through a clean, modern interface.

## Available Applications

### Options Exit Price Calculator

A web-based calculator for determining optimal exit prices for NIFTY/SENSEX call and put options. It accounts for delta changes, theta decay, implied volatility scenarios, and provides stop loss recommendations.

#### Features

- **Exit Price Calculation**: Computes exit price ranges based on spot target levels, considering conservative, base case, and optimistic IV scenarios
- **Stop Loss Calculator**: Supports multiple SL types (% based, points based, spot level based, fixed premium)
- **Trade Types**: Handles both intraday and overnight positions with appropriate theta decay adjustments
- **Risk-Reward Analysis**: Provides P&L projections and trade quality advice
- **Responsive Design**: Modern dark UI with gradient backgrounds

## How to Run

1. Navigate to the project root directory:
   ```bash
   cd trade-helpers
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and go to the main hub: `http://localhost:8080/index.html`

4. From the main hub, click on any application card to access the tool

## Project Structure

```
trade-helpers/
├── index.html          # Main application hub
├── style.css           # Main hub styling
├── README.md           # This file
└── options-exit-stoploss-calculator/
    ├── index.html      # Options calculator interface
    ├── style.css       # Calculator styling
    └── functions.js    # Calculator logic
```

## Technologies Used

- HTML5
- CSS3 (with modern features like backdrop-filter and CSS Grid)
- Vanilla JavaScript

## Usage

### Main Hub
- Access all available trading tools from a single, organized interface
- Each tool is presented as an interactive card with description
- Easy navigation between different calculators

### Options Exit Price Calculator

1. Enter your option details (strike price, entry premium, spot levels, etc.)
2. Select option type (CE/PE), IV scenario, and trade type
3. Click "Calculate Exit Price" to see recommended exit ranges
4. Use the Stop Loss section to set appropriate risk management levels

## Adding New Applications

To add a new trading tool:

1. Create a new subdirectory under the project root
2. Add your application's `index.html`, `style.css`, and any required JavaScript files
3. Add a new card to the `.apps-grid` section in the main `index.html`
4. Update this README with information about the new tool

## Disclaimer

This tool is for educational and informational purposes only. Not financial advice. Always do your own research and consult with financial professionals before making trading decisions.