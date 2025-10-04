# 🚗 Uber Smart Copilot - Mobile Frontend

A beautiful, mobile-first React app for Uber drivers to interact with their AI copilot assistant.

## ✨ Features

- 📱 **Mobile-First Design** - Optimized for drivers using phones while working
- 🤖 **AI Chat Interface** - Real-time conversations with Mistral AI
- 💰 **Earnings Predictor** - AI-powered income forecasting
- 😴 **Rest Optimizer** - Smart break recommendations
- 📊 **Analytics Dashboard** - Real-time driving insights
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS & Framer Motion

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Mobile-First Features

### 🏠 Home Page
- Driver status indicator (Online/Offline)
- Quick action cards for main features
- Smart tips and recommendations
- Real-time earnings summary

### 💬 Chat Page
- Conversational AI interface
- Quick question buttons
- Personalized insights
- Real-time responses

### 💰 Earnings Page
- Interactive hours selector
- AI-powered predictions
- Peak hours guide
- Additional context input

### 😴 Rest Page
- Current time & demand status
- Break recommendations
- Nearby rest locations
- Fatigue check system

### 📊 Dashboard Page
- Real-time statistics
- City performance data
- Experience level insights
- Peak/low demand hours

## 🎨 Design System

### Colors
- **Primary**: Uber Blue (#0ea5e9)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Components
- **Cards**: Elevated containers with shadows
- **Buttons**: Primary, secondary, and ghost variants
- **Inputs**: Styled form controls
- **Navigation**: Bottom tab bar for mobile

### Animations
- **Framer Motion**: Smooth page transitions
- **Micro-interactions**: Button presses, loading states
- **Scroll animations**: Staggered content reveals

## 🔧 Technical Stack

- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library

## 📡 API Integration

The app connects to the FastAPI backend with these endpoints:

- `POST /api/chat` - AI chat messages
- `POST /api/earnings/predict` - Earnings predictions
- `GET /api/rest/optimize` - Rest recommendations
- `GET /api/dashboard/stats` - Dashboard statistics

## 📱 Mobile Optimizations

- **Touch-friendly**: Large tap targets (44px minimum)
- **Thumb navigation**: Bottom tab bar within reach
- **One-handed use**: Optimized for single-hand operation
- **Fast loading**: Optimized bundle size and lazy loading
- **Offline support**: Graceful degradation when API unavailable

## 🎯 User Experience

### For Uber Drivers
- **Quick access**: All features accessible in 1-2 taps
- **Real-time data**: Live updates on earnings and demand
- **Smart suggestions**: AI-powered recommendations
- **Safety first**: Fatigue monitoring and break reminders

### Visual Design
- **Clean interface**: Minimal distractions while driving
- **High contrast**: Readable in various lighting conditions
- **Consistent patterns**: Familiar interactions throughout
- **Progressive disclosure**: Information revealed as needed

## 🚀 Deployment

```bash
# Build the app
npm run build

# Preview production build
npm run preview

# Deploy to your hosting platform
# (Netlify, Vercel, etc.)
```

## 📱 Browser Support

- **Mobile Safari** (iOS 14+)
- **Chrome Mobile** (Android 8+)
- **Firefox Mobile** (Latest)
- **Samsung Internet** (Latest)

## 🎨 Customization

The app uses a design system that can be easily customized:

1. **Colors**: Update `tailwind.config.js`
2. **Fonts**: Modify `src/index.css`
3. **Components**: Edit component files in `src/components/`
4. **Pages**: Customize page layouts in `src/pages/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile devices
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

---

**Built with ❤️ for Uber drivers everywhere** 🚗💨