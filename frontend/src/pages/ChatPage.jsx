import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Car,
  DollarSign,
  Clock,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { chatAPI } from '../services/api';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "🚀 Hey! I'm your personal AI Copilot! I know your profile and can help you with:\n\n• Your personalized earnings predictions\n• Best times and locations for you\n• Weather-aware recommendations for your area\n• Multi-platform optimization (rides + eats)\n• City-specific insights for your home base\n\nWhat would you like to know about maximizing your earnings today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [earnerId, setEarnerId] = useState('E10000'); // Demo earner ID
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // Only scroll when messages are added, not on every keystroke

  // Cleanup: stop speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputMessage(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);

      return () => {
        if (recognitionInstance) {
          recognitionInstance.stop();
        }
      };
    }
  }, []);

  const quickQuestions = [
    "What should I focus on today - rides or eats?",
    "What's my best earning strategy for this week?",
    "When are the peak hours in my city?",
    "How can I optimize my current location?",
    "Show me my personalized earnings forecast"
  ];

  const handleSendMessage = useCallback(async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const messageText = message.trim();
    const timestamp = Date.now();

    const userMessage = {
      id: timestamp,
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(messageText, earnerId);
      
      const botMessage = {
        id: timestamp + 1, // Ensure unique ID
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        earnerInsights: response.earner_insights
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice output is enabled
      speakResponse(response.response);
    } catch (error) {
      const errorMessage = {
        id: timestamp + 1, // Ensure unique ID
        type: 'bot',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, earnerId]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setInputMessage('');
      recognition.start();
    }
  };

  const speakResponse = (text) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    if (!voiceOutputEnabled) return;
    
    // Clean the text for better speech (remove emojis and special characters)
    const cleanText = text.replace(/[📊🚀💡🎯⭐✅❌🔴🎤🗺️📍]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.1; // Slightly faster for efficiency
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setVoiceOutputEnabled(!voiceOutputEnabled);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const MessageBubble = useCallback(({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.isError;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-2 max-w-xs ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser 
              ? 'bg-uber-600' 
              : isError 
                ? 'bg-red-500' 
                : 'bg-green-500'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-uber-600 text-white' 
              : isError
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-white text-gray-900 shadow-sm border border-gray-200'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {/* Earner Insights */}
            {message.earnerInsights && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">📊 Your Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Hourly Rate:</span>
                    <span className="font-semibold text-green-600 ml-1">
                      ${message.earnerInsights.predicted_hourly_earnings}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">vs City Avg:</span>
                    <span className={`font-semibold ml-1 ${
                      message.earnerInsights.performance_vs_city > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {message.earnerInsights.performance_vs_city > 0 ? '+' : ''}{message.earnerInsights.performance_vs_city}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-xs opacity-70 mt-2">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }, []);

  return (
    <div className="h-screen flex flex-col relative">
      {/* Header */}
      <div className="flex items-center space-x-2 px-3 py-2 flex-shrink-0 border-b border-gray-100">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">AI Copilot</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Your personal driving assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-16">
        <AnimatePresence>
          {useMemo(() => 
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            )), [messages]
          )}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4"
        >
          <p className="text-sm text-gray-500 mb-3">💡 Try asking:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((question, index) => (
              <motion.button
                key={question}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => handleSendMessage(question)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 z-50">
        <div className="flex items-end space-x-2">
          {/* Voice Input Button */}
          {voiceSupported && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>
          )}
          
          {/* Voice Output Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoiceOutput}
            className={`p-3 rounded-2xl transition-all ${
              isSpeaking
                ? 'bg-blue-500 text-white animate-pulse'
                : voiceOutputEnabled
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
            }`}
            title={voiceOutputEnabled ? 'Voice output enabled (click to disable)' : 'Voice output disabled (click to enable)'}
          >
            {isSpeaking ? (
              <div className="relative">
                <Volume2 className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              </div>
            ) : voiceOutputEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </motion.button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-uber-500 focus:border-transparent text-sm"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '100px' }}
              disabled={isListening}
            />
            {isListening && (
              <div className="absolute right-3 top-3">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2 rounded-lg transition-colors ${
              inputMessage.trim() && !isLoading
                ? 'bg-uber-600 hover:bg-uber-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          {voiceSupported && '🎤 Voice input • '}
          {voiceOutputEnabled ? '🔊 Voice output ON' : '🔇 Voice output OFF'} • 
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
