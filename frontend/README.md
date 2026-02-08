# Whistle Poddu - Anonymous Workplace Reviews

An anonymous workplace review platform powered by Zero-Knowledge proofs and the Midnight Network, built with **Next.js 14**, **TypeScript**, and **Tailwind CSS v4**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## ✨ New Features

### 🔄 Auto-Login for Verified Users
Once you complete the verification process, your identity is **automatically saved** and you'll be redirected to the global chat on your next visit. No need to verify again!

- **Persistent Verification**: Your verification state is stored securely in localStorage
- **30-Day Validity**: Verification remains active for 30 days
- **One-Click Logout**: Clear your verification anytime with the logout button
- **Seamless Experience**: Return users skip verification and go straight to chat

### 🎨 Tailwind CSS v4
Built with the latest **Tailwind CSS v4** (alpha), featuring:
- **@import "tailwindcss"** - New import syntax
- **@theme directive** - Custom design tokens
- **PostCSS plugin** - `@tailwindcss/postcss`
- **Zero config** - No `tailwind.config.js` needed (uses CSS-based config)

## 📁 Project Structure

```
whistle-poddu-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page (auto-redirect logic)
│   └── globals.css         # Tailwind v4 styles
├── components/
│   ├── WalletConnect.tsx   # Wallet connection
│   ├── VerificationFlow.tsx # 4-step verification
│   ├── GlobalChat.tsx      # Anonymous reviews + logout
│   └── SystemMonitor.tsx   # Network status & logs
├── hooks/
│   └── useVerificationState.ts # Persistent verification hook
├── lib/
│   └── types.ts            # TypeScript types
├── package.json            # Tailwind v4 dependencies
├── postcss.config.js       # @tailwindcss/postcss
└── README.md
```

## 🔐 Verification Flow

### First-Time Users
1. **Upload** → Upload company ID card
2. **Extract** → Review extracted data
3. **Commit** → Generate ZK proof hash
4. **Success** → Anchor to Midnight Network
5. **Auto-Save** → Verification stored for 30 days

### Returning Users
1. **Auto-Redirect** → Instantly access global chat
2. **No Re-Verification** → Skip the entire flow
3. **Logout Option** → Clear verification anytime

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (alpha) |
| **Icons** | Lucide React |
| **Fonts** | Outfit, JetBrains Mono |
| **Crypto** | Web Crypto API (SHA-256) |
| **Storage** | LocalStorage (verification state) |
| **Network** | Midnight Network (optional) |

## 🎨 Tailwind v4 Configuration

### Using @theme Directive
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### PostCSS Setup
```js
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### No tailwind.config.js Needed!
Tailwind v4 uses CSS-based configuration through the `@theme` directive.

## 🔒 Verification State Management

### useVerificationState Hook
```typescript
const { 
  verificationState,  // Current verification or null
  isLoading,          // Loading from localStorage
  saveVerification,   // Save after successful verification
  clearVerification   // Logout functionality
} = useVerificationState();
```

### Verification State Structure
```typescript
interface VerificationState {
  isVerified: boolean;
  userHash: string;
  companyData: CompanyData;
  timestamp: number;  // For 30-day expiry
}
```

### Auto-Redirect Logic
```typescript
useEffect(() => {
  if (!isLoading && verificationState) {
    setMode('chat');              // Switch to chat mode
    setUserHash(verificationState.userHash);
    setCompanyData(verificationState.companyData);
    addLog('Welcome back!');
  }
}, [isLoading, verificationState]);
```

## 🌐 Features

### Privacy-First Design
- ✅ **Local Processing** - ID cards processed in-browser
- ✅ **Zero-Knowledge Proofs** - Only hashes shared
- ✅ **Anonymous Reviews** - Identity protected
- ✅ **Persistent Sessions** - Auto-login without re-verification

### Review System
- ✅ **Categories**: Culture, Management, Compensation, Work-Life, Other
- ✅ **Sentiment Tags**: Positive, Neutral, Negative
- ✅ **Real-time Feed**: Live review updates
- ✅ **Company Attribution**: Show company, hide identity

### Network Integration
- ✅ **Lace Wallet** - Optional Midnight wallet
- ✅ **Simulation Mode** - Automatic fallback
- ✅ **Local Ledger** - Demo mode with localStorage
- ✅ **Production Ready** - Distributed ledger support

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_MIDNIGHT_NETWORK_URL=https://midnight-testnet.io
NEXT_PUBLIC_VERIFICATION_EXPIRY_DAYS=30
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Adding New Components
```typescript
// components/NewComponent.tsx
'use client';

export default function NewComponent() {
  return <div>Component</div>;
}
```

### Using Tailwind v4 Classes
```tsx
<div className="bg-orange-500/20 border-2 border-orange-400/30 rounded-2xl">
  Styled with Tailwind v4
</div>
```

### Custom Animations
```css
/* globals.css */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## 🐛 Troubleshooting

### Verification Not Persisting
- Check browser localStorage permissions
- Verify `VERIFICATION_KEY` in useVerificationState
- Clear localStorage and re-verify

### Tailwind v4 Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Type Errors
Ensure imports use `@/` alias:
```typescript
import { Type } from '@/lib/types';
import Component from '@/components/Component';
```

## 📊 Data Flow

```
User Uploads ID
    ↓
Local OCR Processing
    ↓
Generate SHA-256 Hash
    ↓
Save to LocalStorage ← [Auto-Login Feature]
    ↓
Anchor to Midnight Network
    ↓
Access Global Chat
    ↓
Post Anonymous Reviews
```

## 🔄 Verification Lifecycle

```
First Visit:
  Upload ID → Extract → Commit → Success → Save State

Subsequent Visits:
  Load State → Auto-Redirect to Chat ✅

Logout:
  Clear State → Redirect to Verification
```

## 📝 Future Enhancements

- [ ] Real OCR with Tesseract.js
- [ ] Multi-factor verification
- [ ] Review moderation system
- [ ] Company verification API
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-language support

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Built with inspiration from:
- Zero-Knowledge identity systems
- Anonymous whistleblower platforms
- Midnight Network privacy technology
- Tailwind CSS v4 innovations

---

**Built with Next.js 14 + TypeScript + Tailwind CSS v4**

**Features: Auto-Login • Persistent Verification • ZK Proofs • Anonymous Reviews**
