# PRD — Ephemeral Private Chat (MVP)
> React Native 0.76+ · Expo SDK 55 · InstantDB · react-native-ease · react-native-keyboard-controller

---

## 1. Overview

Une app de chat privé et éphémère. L'utilisateur crée une room, partage un lien, et les messages disparaissent selon les paramètres définis à la création. Zéro compte, zéro inscription — mais l'accès à l'app est protégé localement par biométrie ou PIN.

**Stack :**
- React Native 0.76+ (New Architecture / Fabric)
- Expo SDK 55
- NativeWind (styling)
- InstantDB (real-time, sync)
- `react-native-ease` (animations UI déclaratives)
- `react-native-keyboard-controller` (gestion keyboard)
- `react-native-reanimated` (peer dep obligatoire de keyboard-controller)
- `expo-local-authentication` (fingerprint / Face ID / PIN OS)
- `expo-secure-store` (stockage sécurisé du PIN app)
- `expo-clipboard` + `expo-sharing` (partage du lien)

> ⚠️ Les libs natives requièrent la **New Architecture (Fabric)**.
> S'assurer que `"newArchEnabled": true` dans `app.json`.

---

## 2. User Stories (MVP)

| # | En tant que... | Je veux... | Pour... |
|---|---|---|---|
| 1 | Utilisateur | Définir un PIN à la première ouverture | Protéger l'app localement |
| 2 | Utilisateur | Me déverrouiller avec mon empreinte / Face ID | Accès rapide si biométrie disponible |
| 3 | Utilisateur | Utiliser mon PIN si la biométrie échoue | Avoir un fallback fiable |
| 4 | Utilisateur | Créer une room avec paramètres | Contrôler la durée de vie de la conversation |
| 5 | Utilisateur | Supprimer manuellement une room | Effacer avant expiration |
| 6 | Utilisateur | Partager le lien facilement | Inviter quelqu'un sans compte |
| 7 | Utilisateur | Recevoir les messages en temps réel | Discuter instantanément |

---

## 3. Screens

### 3.1 Lock Screen (gate de l'app)
Premier écran affiché à chaque ouverture ou retour en foreground.

**Premier lancement :**
- Invitation à définir un PIN à 6 chiffres
- Confirmation du PIN
- Si biométrie disponible sur l'appareil → proposer de l'activer (toggle)
- Stocker le PIN hashé dans `expo-secure-store`

**Lancements suivants :**
- Si biométrie activée → déclencher immédiatement `LocalAuthentication.authenticateAsync()`
- Si biométrie échoue ou non activée → afficher le pavé numérique PIN
- 5 tentatives PIN incorrectes → blocage 30 secondes

**UX :**
- Fond sombre, logo centré, pavé numérique custom
- Points • • • • • • qui se remplissent à chaque chiffre saisi
- Shake animation si PIN incorrect (`react-native-ease` spring)

### 3.2 Home Screen (`/`)
- Bouton principal : **"Créer une room"**
- Champ texte : **"Rejoindre avec un code"** + bouton Go

### 3.3 Room Config Bottom Sheet
Affiché avant de créer la room.

**Durée d'expiration**
```
○ 1 heure
○ 6 heures
● 24 heures   ← défaut
○ 7 jours
○ Jamais
```

**Suppression automatique des messages**
```
○ À l'expiration de la room
● Après lecture
○ Jamais
```

**Mot de passe room (optionnel)**
```
[ Protéger avec un mot de passe ]  ← toggle
[ ______________ ]                  ← input si toggle ON
```

Bouton : **"Créer la room"**

### 3.4 Chat Screen (`/chat/[roomId]`)
- Header : code de la room + "Copier" + "Partager" + "⚙️"
- Liste des messages
- Indicateur de présence
- Input bar sticky
- Badge expiration

### 3.5 Room Settings Sheet
Accessible via ⚙️, uniquement au créateur.
- Paramètres actuels (lecture seule)
- **"Supprimer la room"** → confirmation → suppression immédiate

### 3.6 App Settings Screen
Accessible depuis le Home (icône ⚙️ coin haut droit).
- **Changer le PIN**
- **Activer / désactiver la biométrie**
- **Délai de verrouillage** : Immédiat / 1 min / 5 min / 15 min (après passage en background)

### 3.7 Expired / Deleted Screen
- Expirée : "Cette conversation a expiré."
- Supprimée : "Cette conversation a été supprimée."
- Bouton : "Créer une nouvelle room"

---

## 4. Data Model (InstantDB)

```js
{
  rooms: {
    roomId: string,
    createdAt: number,
    creatorId: string,
    expiresAt: number | null,
    messageExpiry: 'on_room_expiry' | 'after_read' | 'never',
    passwordHash: string | null,
    deletedAt: number | null,
  },
  messages: {
    roomId: string,
    text: string,
    senderId: string,
    senderName: string,
    createdAt: number,
    readBy: string[],
    deletedAt: number | null,
  },
  presence: {
    roomId: string,
    senderId: string,
    lastSeen: number,
  }
}
```

**Données stockées localement (expo-secure-store) :**
```js
{
  'app_pin_hash': string,        // SHA-256 du PIN
  'biometric_enabled': boolean,
  'lock_delay_ms': number,       // délai avant verrouillage background
  'sender_id': string,           // identité anonyme locale
}
```

---

## 5. Core Logic

### App Lock — flux complet
```js
// Au démarrage et au retour foreground
const checkLock = async () => {
  const lastBackground = await SecureStore.getItemAsync('last_background_at');
  const delay = await SecureStore.getItemAsync('lock_delay_ms') ?? 0;

  const shouldLock = !lastBackground
    || Date.now() - parseInt(lastBackground) > parseInt(delay);

  if (shouldLock) navigate('LockScreen');
};

// Listener background/foreground
AppState.addEventListener('change', (state) => {
  if (state === 'background') {
    SecureStore.setItemAsync('last_background_at', Date.now().toString());
  }
  if (state === 'active') {
    checkLock();
  }
});
```

### Authentification biométrique
```js
import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Déverrouiller l\'app',
    fallbackLabel: 'Utiliser le PIN',
    disableDeviceFallback: true, // gérer le fallback nous-mêmes
  });

  return result.success;
};
```

### Vérification PIN
```js
import { sha256 } from 'js-sha256';

const verifyPin = async (enteredPin) => {
  const storedHash = await SecureStore.getItemAsync('app_pin_hash');
  return sha256(enteredPin) === storedHash;
};
```

### Génération roomId + logique room
```js
const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const isRoomActive = (room) => {
  if (room.deletedAt) return false;
  if (room.expiresAt && room.expiresAt < Date.now()) return false;
  return true;
};
```

---

## 6. Animations Lock Screen (react-native-ease)

### Points PIN — remplissage
```jsx
<EaseView
  animate={{ scale: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
  transition={{ type: 'spring', damping: 15, stiffness: 300, mass: 0.8 }}
/>
```

### Shake si PIN incorrect
```jsx
<EaseView
  animate={{ translateX: shaking ? 10 : 0 }}
  transition={{ type: 'spring', damping: 4, stiffness: 400, mass: 0.5 }}
  // Déclencher : setShaking(true) → false après 500ms
/>
```

### Fade out lock screen après succès
```jsx
<EaseView
  animate={{ opacity: unlocked ? 0 : 1 }}
  transition={{ type: 'timing', duration: 300, easing: 'easeOut' }}
  onTransitionEnd={() => unlocked && navigate('Home')}
/>
```

---

## 7. Gestion Keyboard (react-native-keyboard-controller)

### Setup root (`_layout.tsx`)
```jsx
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack />
    </KeyboardProvider>
  );
}
```

### Chat Screen
```jsx
<KeyboardAwareScrollView bottomOffset={8} style={{ flex: 1 }}>
  <MessageList messages={messages} />
</KeyboardAwareScrollView>

<KeyboardStickyView offset={{ opened: 0, closed: 0 }}>
  <MessageInput onSend={handleSend} />
</KeyboardStickyView>
```

---

## 8. Comportements importants

| Comportement | Détail |
|---|---|
| **Verrouillage** | App se verrouille selon le délai configuré au passage en background |
| **Biométrie** | Déclenchée automatiquement à l'ouverture si activée |
| **Fallback PIN** | Affiché si biométrie échoue ou non disponible |
| **5 mauvais PIN** | Blocage 30 secondes, compteur visible |
| **Premier lancement** | Forcer la création d'un PIN avant tout accès |
| **Suppression room** | Seul le créateur peut supprimer — synced real-time |
| **After read** | Message fade out une fois lu par tous les présents |
| **Keyboard** | Géré par `react-native-keyboard-controller` — fluide iOS + Android |

---

## 9. Structure de fichiers

```
app/
├── _layout.tsx                # KeyboardProvider + AppState listener
├── lock.tsx                   # Lock Screen (PIN + biométrie)
├── index.tsx                  # Home Screen
├── settings.tsx               # App Settings (PIN, biométrie, délai)
├── chat/
│   └── [roomId].tsx           # Chat Screen
└── expired.tsx                # Expired / Deleted Screen

components/
├── PinPad.tsx                 # Pavé numérique custom
├── PinDots.tsx                # Points • • • • • • animés
├── MessageBubble.tsx
├── MessageInput.tsx
├── RoomHeader.tsx
├── PresenceIndicator.tsx
├── ExpiryBadge.tsx
├── RoomConfigSheet.tsx
└── RoomSettingsSheet.tsx

lib/
├── instant.ts                 # Config InstantDB + schema
├── identity.ts                # senderId anonyme
├── room.ts                    # generateRoomId, isRoomActive
└── auth.ts                    # verifyPin, biometrics, lockState

hooks/
├── useMessages.ts
├── usePresence.ts
├── useExpiry.ts
├── useReadReceipts.ts
└── useLockState.ts            # Gestion verrouillage + AppState
```

---

## 10. Config Expo requise

**`app.json`**
```json
{
  "expo": {
    "newArchEnabled": true,
    "plugins": [
      "expo-local-authentication",
      "expo-secure-store"
    ]
  }
}
```

**Permissions iOS (`Info.plist` via plugin) :**
```
NSFaceIDUsageDescription = "Utilisé pour déverrouiller l'app"
```

---

## 11. Hors scope MVP

- Réactions / emojis
- Images / fichiers
- Notifications push
- Chiffrement end-to-end
- Historique des rooms
- Récupération du PIN perdu (reset = réinstallation)

---

## 12. Critères de succès MVP

- [ ] PIN défini au premier lancement, impossible de bypasser
- [ ] Biométrie fonctionne sur iOS (Face ID) et Android (fingerprint)
- [ ] Fallback PIN opérationnel si biométrie échoue
- [ ] App verrouillée au retour foreground selon délai configuré
- [ ] Créer une room avec paramètres en < 3 taps
- [ ] Premier message visible chez l'autre en < 500ms
- [ ] Suppression room → tous voient "Supprimée" en temps réel
- [ ] Input bar suit le keyboard parfaitement iOS et Android
