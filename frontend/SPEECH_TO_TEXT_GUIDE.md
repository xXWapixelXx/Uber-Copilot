# 🎤 Speech-to-Text Implementation Guide

This guide explains how to use and customize the speech-to-text (voice input) feature in the Uber Copilot frontend.

---

## 📋 Overview

The speech-to-text feature allows drivers to interact with the Copilot using voice commands instead of typing. This is especially useful for drivers who need hands-free operation while on the road.

### Key Features:
- ✅ Browser-based speech recognition (no API costs)
- ✅ Real-time transcription
- ✅ Visual feedback when listening
- ✅ Error handling and user notifications
- ✅ Automatic microphone permission handling
- ✅ Cross-browser compatibility (Chrome, Edge, Safari)

---

## 🛠️ Technology Used

### Web Speech API
We use the **Web Speech API**, which is built into modern browsers:

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
```

**Browser Support:**
- ✅ Chrome/Edge: Full support
- ✅ Safari: Full support (iOS 14.5+)
- ⚠️ Firefox: Limited support
- ❌ IE: Not supported

---

## 📁 Components

### 1. `VoiceInput.jsx`
The core voice input component that handles speech recognition.

**Props:**
- `onTranscript`: Callback function called when speech is recognized
- `onError`: Callback function for error handling

**Usage:**
```jsx
import { VoiceInput } from './components/VoiceInput';

<VoiceInput 
  onTranscript={(text) => console.log('Recognized:', text)}
  onError={(error) => console.error('Error:', error)}
/>
```

### 2. `ChatInterface.jsx`
A complete chat interface with integrated voice input.

**Features:**
- Voice and text input
- Message history
- Bot responses
- Error notifications

**Usage:**
```jsx
import { ChatInterface } from './components/ChatInterface';

<ChatInterface />
```

---

## 🚀 Quick Start

### Step 1: Add to Your Page

```jsx
import { ChatInterface } from './components/ChatInterface';

function App() {
  return (
    <div>
      <ChatInterface />
    </div>
  );
}
```

### Step 2: Enable Microphone Permissions

When users first click the microphone icon, the browser will request microphone permission. Make sure to:

1. Use HTTPS (required for microphone access)
2. Inform users why you need microphone access
3. Handle permission denial gracefully

### Step 3: Test It

1. Click the microphone icon
2. Allow microphone access when prompted
3. Speak clearly into your microphone
4. The transcription will appear in the input field

---

## 🎨 Customization

### Change Voice Recognition Language

In `VoiceInput.jsx`:

```javascript
recognitionInstance.lang = 'en-US'; // Change to your language
// Options: 'en-GB', 'es-ES', 'fr-FR', 'de-DE', etc.
```

### Enable Continuous Recognition

For ongoing voice input:

```javascript
recognitionInstance.continuous = true; // Keep listening
```

### Auto-Send After Voice Input

In `ChatInterface.jsx`, uncomment this line:

```javascript
const handleVoiceTranscript = (transcript) => {
  setInputValue(transcript);
  sendMessage(transcript); // ← Uncomment this line
};
```

---

## 🔧 Configuration Options

### Recognition Settings

```javascript
const recognitionInstance = new SpeechRecognition();

// Basic settings
recognitionInstance.continuous = false;      // Stop after one phrase
recognitionInstance.interimResults = true;   // Show results while speaking
recognitionInstance.lang = 'en-US';          // Language
recognitionInstance.maxAlternatives = 1;     // Number of alternatives

// Advanced settings
recognitionInstance.grammars = null;         // Custom grammar
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Speech recognition not supported"
**Solution:** Use Chrome, Edge, or Safari. Firefox has limited support.

### Issue 2: "Microphone permission denied"
**Solution:** 
1. Check browser settings
2. Make sure you're using HTTPS
3. Guide users to enable microphone in browser settings

### Issue 3: "No speech detected"
**Solution:**
- Check microphone is working
- Speak louder and clearer
- Reduce background noise

### Issue 4: Not working on mobile
**Solution:**
- iOS requires Safari (not Chrome/Firefox)
- Android works best with Chrome
- Test on actual devices, not emulators

---

## 📱 Mobile Considerations

### iOS (iPhone/iPad)
```javascript
// iOS Safari specific handling
if (iOS) {
  // Requires user gesture to start
  // Must use Safari browser
  // Works from iOS 14.5+
}
```

### Android
```javascript
// Android Chrome works well
// May need "Use microphone" permission
```

---

## 🔐 Security & Privacy

### Best Practices:

1. **Always use HTTPS** - Required for microphone access
2. **Inform users** - Explain why you need microphone access
3. **Local processing** - Web Speech API processes on-device (no data sent to your server)
4. **No recording** - Speech is transcribed, not recorded

### Privacy Notice Example:
```jsx
<Typography variant="caption">
  🔒 Voice input is processed locally on your device. 
  We don't record or store audio.
</Typography>
```

---

## 🎯 Use Cases for Drivers

### Example Voice Commands:

1. **Earnings queries:**
   - "How much have I earned today?"
   - "What's my weekly total?"

2. **Break recommendations:**
   - "When should I take a break?"
   - "Is now a good time to rest?"

3. **Demand predictions:**
   - "Where is the highest demand right now?"
   - "What are the best areas to drive?"

4. **Safety:**
   - "Am I driving too long?"
   - "When should I stop for the day?"

---

## 🧪 Testing

### Manual Testing Checklist:

- [ ] Microphone icon appears
- [ ] Clicking icon requests permission
- [ ] Permission granted → icon changes color
- [ ] Speaking → transcription appears
- [ ] Transcription → populates input field
- [ ] Stop button → stops listening
- [ ] Error handling → shows error message
- [ ] Works on mobile devices
- [ ] Works in different browsers

### Test Commands:
```
"Hello, can you hear me?"
"What time should I start driving?"
"Show me my earnings"
```

---

## 🚀 Advanced Features (Future Enhancements)

### 1. Voice Commands (Wake Words)
```javascript
// Detect specific commands
if (transcript.includes('hey copilot')) {
  // Activate special mode
}
```

### 2. Multiple Languages
```javascript
// Auto-detect language
const detectLanguage = (text) => {
  // Implementation
};
```

### 3. Voice Feedback (Text-to-Speech)
```javascript
// Respond with voice
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
```

### 4. Offline Support
```javascript
// Cache recognition results
// Work without internet
```

---

## 📚 Resources

- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Compatibility](https://caniuse.com/speech-recognition)
- [Speech Recognition Examples](https://github.com/mdn/dom-examples/tree/main/web-speech-api)

---

## 💡 Tips for Best Results

1. **Speak clearly** - Enunciate words
2. **Reduce noise** - Minimize background sounds
3. **Good microphone** - Use quality mic if possible
4. **Short phrases** - Break long sentences into parts
5. **Natural pace** - Don't speak too fast or slow

---

## 🎬 Demo Script

```javascript
// Test the voice input
import { VoiceInput } from './components/VoiceInput';

function Demo() {
  return (
    <VoiceInput 
      onTranscript={(text) => {
        console.log('You said:', text);
        alert(`You said: ${text}`);
      }}
      onError={(error) => {
        console.error('Error:', error);
      }}
    />
  );
}
```

---

**Questions?** Check the component code in `VoiceInput.jsx` or open an issue on GitHub.
