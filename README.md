# Sports Betting Hub

A lightweight, responsive sports betting odds display application built with vanilla JavaScript.

## Features

- Real-time odds display for multiple sports
- Responsive design for mobile and desktop
- Easy-to-read match information and odds
- Auto-refresh functionality

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/betting-site.git
cd betting-site
```

2. Configure the application:

   - Rename `config.example.js` to `config.js`
   - Update the API configuration in `config.js`

3. Serve the application:
   - Use a local server (e.g., Live Server for VS Code)
   - Or use Python's built-in server:

```bash
python -m http.server 8000
```

## Configuration

Update `config.js` with your API settings:

```javascript
export const CONFIG = {
  API_BASE_URL: "your-api-endpoint",
  API_KEY: "your-api-key",
  REFRESH_INTERVAL: 30000,
  USE_MOCK_DATA: false,
};
```

## Development

The project uses vanilla JavaScript with ES6 modules. No build step required.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
