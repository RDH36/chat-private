# Brume

Messagerie ephemere et anonyme. Creez des rooms, partagez un lien, et les messages disparaissent automatiquement. Zero compte, zero inscription.

## Features

- **Messages ephemeres** — les messages s'auto-detruisent selon un timer configurable
- **Rooms publiques et privees** — protegees par mot de passe optionnel
- **Aucun compte requis** — commencez a chatter en 5 secondes
- **Verrouillage biometrique** — PIN + Face ID / empreinte digitale
- **Temps reel** — messagerie instantanee via InstantDB
- **Multi-langue** — francais et anglais

## Stack technique

| Technologie | Usage |
|---|---|
| Expo SDK 55 | Framework React Native |
| Expo Router | Navigation file-based |
| InstantDB | Backend temps reel |
| Reanimated 4 | Animations |
| NativeWind | Styling utilitaire |
| i18next | Internationalisation |
| Expo Secure Store | Stockage securise (PIN) |
| Expo Local Auth | Biometrie |

## Demarrage

```bash
# Installer les dependances
pnpm install

# Lancer le serveur de dev
pnpm start

# Lancer sur Android
pnpm android

# Lancer sur iOS
pnpm ios
```

## Structure du projet

```
app/
  (onboarding)/     # Funnel d'onboarding (quiz, empathy, solution, wow)
  (tabs)/           # Ecrans principaux (rooms publiques, mes rooms)
  chat/             # Ecran de conversation
  settings/         # Reglages (profil, securite, compte)
components/
  onboarding/       # Composants onboarding (DemoBubble, Particles, etc.)
  chat/             # MessageBubble, MessageInput, RoomHeader
  home/             # HomeHeader, RoomCard, SearchBar
  lock/             # LockScreen, PinPad, PinDots
  ui/               # Composants generiques (Button, Input, Badge, etc.)
hooks/              # Hooks custom (useLockState, useMessages, useOnboarding, etc.)
lib/                # Utilitaires (theme, auth, i18n, room, identity, InstantDB)
```

## Licence

Prive — tous droits reserves.
