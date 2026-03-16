# Trade Helpers

A collection of trading tools and calculators to assist with options trading decisions.

## Options Exit Price Calculator

A web-based calculator for determining optimal exit prices for NIFTY/SENSEX call and put options. It accounts for delta changes, theta decay, implied volatility scenarios, and provides stop loss recommendations.

### Features

- **Exit Price Calculation**: Computes exit price ranges based on spot target levels, considering conservative, base case, and optimistic IV scenarios
- **Stop Loss Calculator**: Supports multiple SL types (% based, points based, spot level based, fixed premium)
- **Trade Types**: Handles both intraday and overnight positions with appropriate theta decay adjustments
- **Risk-Reward Analysis**: Provides P&L projections and trade quality advice
- **Responsive Design**: Modern dark UI with gradient backgrounds

### How to Run

1. Navigate to the `options-exit-stoploss-calculator` directory:
   ```bash
   cd options-exit-stoploss-calculator
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open your browser and go to: `http://localhost:8000/index.html`

### Technologies Used

- HTML5
- CSS3 (with modern features like backdrop-filter)
- Vanilla JavaScript

### Usage

1. Enter your option details (strike price, entry premium, spot levels, etc.)
2. Select option type (CE/PE), IV scenario, and trade type
3. Click "Calculate Exit Price" to see recommended exit ranges
4. Use the Stop Loss section to set appropriate risk management levels

### Disclaimer

This tool is for educational and informational purposes only. Not financial advice. Always do your own research and consult with financial professionals before making trading decisions.