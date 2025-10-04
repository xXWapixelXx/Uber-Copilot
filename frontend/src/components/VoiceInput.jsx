import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { styled } from '@mui/material/styles';

const PulsingMic = styled(IconButton)(({ theme, isListening }) => ({
  animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(39, 110, 241, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(39, 110, 241, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(39, 110, 241, 0)',
    },
  },
}));

export const VoiceInput = ({ onTranscript, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      if (onError) {
        onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
      console.log('Voice recognition started');
    };

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (onError) {
        let errorMessage = 'An error occurred during speech recognition.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your device.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please enable it in browser settings.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        onError(errorMessage);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      console.log('Voice recognition ended');
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [onTranscript, onError]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
    }
  };

  if (!isSupported) {
    return (
      <Tooltip title="Speech recognition not supported in this browser">
        <span>
          <IconButton disabled>
            <MicOffIcon />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={isListening ? 'Stop listening' : 'Start voice input'}>
        <PulsingMic
          onClick={toggleListening}
          color={isListening ? 'primary' : 'default'}
          isListening={isListening}
        >
          {isListening ? <MicIcon /> : <MicOffIcon />}
        </PulsingMic>
      </Tooltip>
      {isListening && (
        <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>
          Listening... {transcript && `"${transcript}"`}
        </Typography>
      )}
    </Box>
  );
};
