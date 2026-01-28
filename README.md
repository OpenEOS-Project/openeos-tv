# OpenEOS TV

FireTV/Android TV App für das OpenEOS-Kassensystem. Bietet verschiedene Display-Modi für Küche, Ausgabe, Speisekarte und mehr.

## Features

- **Speisekarte**: Zeigt Produkte und Kategorien an (nicht interaktiv)
- **Küchen-Display**: Zeigt neue Bestellungen, Items als "fertig" markieren (interaktiv)
- **Ausgabe-Display**: Zeigt fertige Items, als "ausgegeben" markieren (interaktiv)
- **Kunden-Abholung**: Große Bestellnummern für fertige Bestellungen (nicht interaktiv)
- **Kassen-Summe**: Tagesumsatz und Statistiken (nicht interaktiv)

## Tech-Stack

- React Native (Android TV Build)
- TypeScript
- @react-navigation/native-stack
- Zustand + TanStack Query
- Socket.io-client
- i18next + react-i18next
- @noriginmedia/norigin-spatial-navigation

## Setup

### Voraussetzungen

- Node.js >= 18
- Android Studio mit Android SDK
- Java 17

### Installation

```bash
# Dependencies installieren
npm install

# oder mit pnpm
pnpm install
```

### Development

```bash
# Metro bundler starten
npm start

# Android TV App starten
npm run android
```

### Release Build

```bash
# APK erstellen
npm run android:release

# APK liegt dann in:
# android/app/build/outputs/apk/release/app-release.apk
```

## FireTV Installation

```bash
# FireTV IP ermitteln (Einstellungen → Netzwerk)
# ADB Debugging auf FireTV aktivieren

# Verbinden
adb connect <firetv-ip>:5555

# APK installieren
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Projekt-Struktur

```
openeos-tv/
├── android/                    # Android TV native Code
├── src/
│   ├── components/
│   │   ├── ui/                 # FocusableCard, FocusableButton, TVText
│   │   ├── registration/       # QRCodeDisplay
│   │   ├── displays/           # Display-spezifische Komponenten
│   │   └── common/             # Header, Clock, ConnectionStatus
│   ├── screens/
│   │   ├── DeviceRegisterScreen.tsx
│   │   ├── DeviceVerificationScreen.tsx
│   │   ├── DisplayModeSelectScreen.tsx
│   │   ├── displays/           # Menu, Kitchen, Delivery, Pickup, Sales
│   │   └── SettingsScreen.tsx
│   ├── stores/
│   │   ├── device-store.ts     # Geräte-Registrierung
│   │   └── display-store.ts    # Display-Modi State
│   ├── hooks/
│   │   ├── useDeviceSocket.ts
│   │   ├── useDisplaySocket.ts
│   │   ├── useHeartbeat.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   └── storage.ts
│   ├── i18n/                   # DE/EN Übersetzungen
│   ├── types/                  # TypeScript Definitionen
│   └── constants/              # Konfiguration
├── App.tsx                     # Haupt-Entry-Point
├── package.json
└── tsconfig.json
```

## TV-Navigation (D-Pad)

| Taste | Aktion |
|-------|--------|
| Hoch/Runter | Liste navigieren |
| Links/Rechts | Kategorie/Bestellung wechseln |
| Select/OK | Aktion ausführen |
| Back | Zurück |
| Menu | Einstellungen |

## WebSocket Events

### Küchen-Display
- Empfängt: `display:order:new`, `display:order:updated`
- Sendet: `display:item:ready`

### Ausgabe-Display
- Empfängt: `display:item:ready`, `display:order:ready`
- Sendet: `display:item:deliver`

### Speisekarte
- Empfängt: `product:updated`

### Kassen-Summe
- Empfängt: `payment:received`, `display:stats:updated`

## Konfiguration

Die API-URL kann in `src/constants/index.ts` angepasst werden:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://192.168.1.100:3001/api' // Dev-Maschine IP
    : 'https://api.openeos.de/api',
  // ...
};
```

## Lizenz

Proprietär - OpenEOS
