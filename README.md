# 🎌 A.R.T. - Anime Recommendation Terminal

A retro 90s-inspired anime recommendation system with authentic CRT monitor aesthetics, powered by AI and the AniList database.

## ✨ Features

- **Retro CRT Aesthetics**: Authentic 90s terminal interface with scanlines, phosphor glow, and pixel fonts
- **AI-Powered Recommendations**: Uses OpenRouter AI to analyze your preferences
- **AniList Integration**: Fetches detailed anime information with English titles
- **Interactive Quiz**: 5 carefully crafted questions to understand your taste
- **Vintage Animations**: Boot sequences, glitch effects, and retro loading 
- **Responsive Design**: Works on desktop and mobile with maintained retro feel

## 🚀 Quick Start

### Live Demo
🌐 **[Try it live on Vercel!](https://retro-anime-terminal.vercel.app)**

### Local Development

#### Prerequisites
- Node.js 16+ installed
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai/))

#### Installation

1. **Clone and setup**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/retro-anime-terminal.git
   cd retro-anime-terminal
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. **Start development**:
   ```bash
   # Terminal 1 - Start the backend server
   npm run server
   
   # Terminal 2 - Start the frontend
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

## 🎮 How to Use

1. **Boot Sequence**: Watch the retro terminal boot up
2. **Take the Quiz**: Answer 5 questions about your anime preferences:
   - **Q1**: Your favorite anime (anchor point)
   - **Q2**: Desired vibe (epic, relaxing, funny, dark)
   - **Q3**: Preferred genres (select up to 3)
   - **Q4**: Things to avoid (dealbreakers)
   - **Q5**: Keywords describing your perfect show
3. **Loading**: Enjoy the retro loading sequence
4. **Results**: Browse 15 personalized anime recommendations
5. **Start Over**: Return to quiz for new recommendations

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: OpenRouter API (Claude-3-Haiku)
- **Data**: AniList GraphQL API
- **Styling**: Custom CSS with retro CRT effects
- **Fonts**: Press Start 2P, VT323, IBM Plex Mono

## 🎨 Design Philosophy

The entire interface is designed around the "90s Anime VHS & CRT Monitor" aesthetic:

- **Typography**: Monospaced and pixel fonts only
- **Colors**: Phosphor green, amber, cyan, and magenta on dark backgrounds
- **Animations**: Sharp, digital, slightly "clunky" - never smooth
- **Effects**: Scanlines, vignette, text glow, and glitch effects
- **Interactions**: Instant color inversions, pixel-perfect borders

## 📁 Project Structure

```
anime 1/
├── src/
│   ├── components/
│   │   ├── BootScreen.jsx      # Initial boot sequence
│   │   ├── QuizScreen.jsx      # 5-question form
│   │   ├── LoadingScreen.jsx   # Retro loading animation
│   │   ├── ResultsScreen.jsx   # Recommendation display
│   │   └── AnimeCard.jsx       # Individual anime cards
│   ├── App.jsx                 # Main application logic
│   ├── main.jsx               # React entry point
│   └── index.css              # Custom retro styles
├── server/
│   ├── services/
│   │   └── recommendationService.js  # AI + AniList integration
│   └── index.js               # Express server
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 API Endpoints

- `GET /api/health` - Health check
- `POST /api/recommendations` - Get anime recommendations

### Request Format
```json
{
  "favoriteAnime": "Attack on Titan",
  "vibe": "epic",
  "genres": ["Action", "Drama"],
  "dealbreakers": ["slow"],
  "keywords": "military strategy"
}
```

## 🎯 Error Handling

The system handles various error scenarios gracefully:

- **AI_CONNECTION_ERROR**: OpenRouter API issues
- **ANILIST_DB_ERROR**: AniList API problems  
- **INPUT_REQUIRED**: Empty form submission
- **NO_RESULTS**: No matching anime found

## 🚀 Deployment

For serverless deployment, consider:

- **Frontend**: Netlify, Vercel, or GitHub Pages
- **Backend**: Railway, Render, or Heroku
- **Environment**: Ensure `OPENROUTER_API_KEY` is set in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (maintain the retro aesthetic!)
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for your own retro anime adventures!

## 🎌 Credits

- **Fonts**: Google Fonts (Press Start 2P, VT323, IBM Plex Mono)
- **Data**: AniList API
- **AI**: OpenRouter platform
- **Inspiration**: 90s anime culture and vintage computing

---

*Experience anime recommendations like it's 1995! 🖥️✨*
