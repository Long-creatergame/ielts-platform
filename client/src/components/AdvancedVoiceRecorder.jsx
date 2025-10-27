import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdvancedVoiceRecorder = ({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop,
  maxDuration = 120, // 2 minutes default
  showWaveform = true,
  autoStart = false,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Check if browser supports MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError(t('voiceRecorder.notSupported', 'Voice recording is not supported in this browser'));
      return;
    }

    if (autoStart) {
      startRecording();
    }

    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio analysis for volume visualization
      if (showWaveform) {
        setupAudioAnalysis(stream);
      }

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, url);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

      if (onRecordingStart) {
        onRecordingStart();
      }

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(t('voiceRecorder.microphoneError', 'Could not access microphone. Please check permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (onRecordingStop) {
        onRecordingStop();
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const setupAudioAnalysis = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start volume analysis
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (analyser && isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(average);
          animationRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      updateVolume();
    } catch (err) {
      console.error('Error setting up audio analysis:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeColor = () => {
    if (volume < 30) return 'bg-gray-400';
    if (volume < 60) return 'bg-yellow-400';
    if (volume < 90) return 'bg-orange-400';
    return 'bg-red-400';
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 text-sm">
          {t('voiceRecorder.notSupported', 'Voice recording is not supported in this browser')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('voiceRecorder.title', 'Voice Recorder')}
        </h3>
        <div className="text-sm text-gray-500">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Waveform Visualization */}
      {showWaveform && (
        <div className="mb-4">
          <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 h-8 rounded-full transition-all duration-150 ${
                    isRecording && !isPaused 
                      ? getVolumeColor() 
                      : 'bg-gray-300'
                  }`}
                  style={{
                    height: isRecording && !isPaused 
                      ? `${Math.max(4, (volume / 100) * 32 + Math.random() * 8)}px`
                      : '4px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>{t('voiceRecorder.start', 'Start Recording')}</span>
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{t('voiceRecorder.pause', 'Pause')}</span>
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>{t('voiceRecorder.resume', 'Resume')}</span>
              </button>
            )}
            
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{t('voiceRecorder.stop', 'Stop')}</span>
            </button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t('voiceRecorder.playback', 'Playback')}
          </h4>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/webm" />
            {t('voiceRecorder.notSupported', 'Your browser does not support audio playback')}
          </audio>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p>{t('voiceRecorder.instructions', 'Click start to begin recording. You can pause and resume as needed. The recording will automatically stop after the maximum duration.')}</p>
      </div>
    </div>
  );
};

export default AdvancedVoiceRecorder;
