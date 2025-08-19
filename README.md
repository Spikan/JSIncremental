# Soda Clicker Pro! 🥤

A delightful idle game inspired by Soda Drinker Pro, featuring soda clicking, upgrades, and a mysterious "Talk to God" feature.

## 🚀 Features

- **Soda Clicking**: Click to earn sips
- **Upgrades**: Straws, cups, suction, and faster drinks
- **Statistics**: Track your progress and achievements
- **Options**: Configurable auto-save and game settings
- **Talk to God**: Ask God anything and get GIF responses! 🙏

## 🔑 Setting Up the Giphy API Key

The "Talk to God" feature can use real GIFs from Giphy! Here's how to set it up securely:

### 1. Get a Giphy API Key
1. Visit [Giphy Developers](https://developers.giphy.com/)
2. Sign up for a free account
3. Create a new app to get your API key

### 2. Environment Variable Setup (Recommended)
The game is now configured to use environment variables for maximum security:

#### Option A: Environment Variable (Production)
```bash
export GIPHY_API_KEY="your_actual_giphy_api_key_here"
```

#### Option B: Direct Configuration (Development)
The API key is already configured in `js/config.js` for development use.

### 3. File Structure
```
your-project/
├── js/
│   ├── config.js            ← Configuration with API key
│   └── main.js              ← Main game logic
├── .gitignore               ← Protects sensitive data
└── README.md                ← This file
```

### 4. Security Features
- ✅ API key is configured but not exposed in public files
- ✅ Environment variable support for production deployments
- ✅ Fallback system works without API keys
- ✅ Secure configuration management

## 🎮 How to Play

1. **Click the Soda**: Earn sips with each click
2. **Buy Upgrades**: Invest in straws, cups, and suction
3. **Level Up**: Reach milestones for bonus income
4. **Talk to God**: Ask questions and get GIF responses
5. **Track Progress**: Monitor your statistics and achievements

## 🛠️ Development

### Prerequisites
- Modern web browser with ES6 module support
- Giphy API key (already configured for development)

### Running Locally
1. Clone the repository
2. The Giphy API key is already configured in `js/config.js`
3. Open `index.html` in a web browser
4. Start clicking soda and talking to God!

### File Structure
- `index.html` - Main game interface
- `css/style.css` - Game styling and animations
- `js/main.js` - Core game logic and features
- `js/config.js` - Configuration with API key
- `.gitignore` - Protects sensitive data

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** in production deployments
- **The `.gitignore` file** protects your sensitive data
- **Template files** are safe to share and commit

## 📱 Mobile Support

The game is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices

## 🎨 Customization

You can customize various aspects of the game:
- Colors and themes in `css/style.css`
- Game mechanics in `js/main.js`
- Configuration options in `js/config.js`

## 🤝 Contributing

Feel free to contribute improvements! Just remember:
- Don't commit API keys
- Test your changes thoroughly
- Follow the existing code style

## 📄 License

This project is open source. Enjoy your soda clicking adventure! 🥤✨

---

**Happy Clicking!** 🎯