# Sooral Cricket Board Mobile App 🏏

A React Native mobile application for the Sooral Premier League (SPL), providing comprehensive cricket statistics, player rankings, and tournament information.

## 📱 Features

- **Home Dashboard** - Overview of league statistics, top performers, and rankings
- **Player Statistics** - Detailed batting and bowling stats for all players
- **Tournament Matches** - Match results, scorecards, and Man of the Match awards
- **Rankings System** - Batting, bowling, and all-rounder rankings with points
- **Beautiful UI** - Premium dark theme with smooth animations and gradients

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AjithMogaveeraSooral/sooral-cricket-board-mobile.git
cd sooral-cricket-board-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation (Bottom Tabs)
- **Styling**: React Native StyleSheet with Linear Gradients
- **Icons**: Expo Vector Icons (Ionicons)
- **Animations**: React Native Animated API

## 📁 Project Structure

```
sooral-cricket-board-mobile/
├── App.js                    # Main app entry with navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── assets/                   # Images, icons, splash screens
└── src/
    ├── components/           # Reusable UI components
    │   ├── LeaderCard.js     # League leaders display
    │   ├── MatchCard.js      # Match information card
    │   ├── PlayerCard.js     # Player statistics card
    │   ├── Rank1Card.js      # Top ranked player card
    │   ├── RankingList.js    # Rankings leaderboard
    │   └── ScorecardModal.js # Detailed match scorecard
    ├── constants/
    │   └── colors.js         # Theme colors and gradients
    ├── contexts/
    │   └── SPLContext.js     # Global state management
    ├── data/
    │   └── spl_data.json     # Cricket statistics data
    ├── screens/
    │   ├── HomeScreen.js     # Home dashboard
    │   ├── PlayerStatsScreen.js # Player listing
    │   └── TournamentsScreen.js # Tournament matches
    ├── services/
    │   └── api.js            # Data fetching services
    └── utils/
        ├── animations.js     # Animation utilities
        └── calculations.js   # Stats calculation helpers
```

## 🎨 Theme

The app features a premium dark theme with:
- Deep blue/purple backgrounds
- Cyan/teal accent colors
- Gold, silver, and bronze medal colors
- Glassmorphism effects
- Smooth gradient transitions

## 📊 Data

The app displays statistics for:
- **Batting**: Runs, highest score, strike rate, average, fours, sixes
- **Bowling**: Wickets, economy, strike rate, best spell, overs
- **All-rounder**: Combined batting and bowling points

## 🏗️ Building for Production

### Android (APK/AAB)

```bash
# Configure EAS Build
eas build:configure

# Build APK for testing
eas build -p android --profile preview

# Build AAB for Play Store
eas build -p android --profile production
```

### iOS

```bash
eas build -p ios --profile production
```

## 📄 Privacy Policy

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for our privacy policy.

## 👨‍💻 Developer

**Ajith Mogaveera Sooral**
- GitHub: [@AjithMogaveeraSooral](https://github.com/AjithMogaveeraSooral)

## 📝 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

- Sooral Premier League organizers and players
- React Native and Expo teams
- The open-source community

---

Made with ❤️ for cricket enthusiasts
