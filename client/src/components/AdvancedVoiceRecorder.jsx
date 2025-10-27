import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdvancedVoiceRecorder = ({ 
  onRecordingComplete, 
  maxDuration = 120, 
  className = '',
  showInstructions = true 
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports media recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError(t('voiceRecorder.notSupported', 'Voice recording is not supported in this browser'));
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, t]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, audioUrl);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError(t('voiceRecorder.microphoneError', 'Could not access microphone. Please check permissions.'));
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (recordingTime / maxDuration) * 100;
  };

  if (!isSupported) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-red-600 text-4xl mb-2">🎤</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {t('voiceRecorder.notSupported', 'Voice recording not supported')}
        </h3>
        <p className="text-red-600">
          {t('voiceRecorder.notSupportedDesc', 'Your browser does not support voice recording. Please use a modern browser like Chrome, Firefox, or Safari.')}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {showInstructions && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('voiceRecorder.title', 'Voice Recorder')}
          </h3>
          <p className="text-gray-600 text-sm">
            {t('voiceRecorder.instructions', 'Click start to begin recording. You can pause and resume as needed. The recording will automatically stop after the maximum duration.')}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Status */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
            isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 
            isPaused ? 'bg-yellow-100 text-yellow-600' : 
            'bg-gray-100 text-gray-600'
          }`}>
            {isRecording ? '🎤' : isPaused ? '⏸️' : '🎙️'}
          </div>
          
          {/* Progress ring */}
          {isRecording && (
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                className="text-red-300"
              />
            </svg>
          )}
        </div>

        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatTime(recordingTime)}
        </div>
        
        <div className="text-sm text-gray-600">
          {isRecording && t('voiceRecorder.recording', 'Recording...')}
          {isPaused && t('voiceRecorder.paused', 'Paused')}
          {!isRecording && !isPaused && t('voiceRecorder.ready', 'Ready to record')}
        </div>

        {/* Progress bar */}
        {isRecording && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording && !isPaused && (
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>🎤</span>
            <span>{t('voiceRecorder.start', 'Start Recording')}</span>
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={pauseRecording}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>⏸️</span>
              <span>{t('voiceRecorder.pause', 'Pause')}</span>
            </button>
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>⏹️</span>
              <span>{t('voiceRecorder.stop', 'Stop')}</span>
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeRecording}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>▶️</span>
              <span>{t('voiceRecorder.resume', 'Resume')}</span>
            </button>
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>⏹️</span>
              <span>{t('voiceRecorder.stop', 'Stop')}</span>
            </button>
          </>
        )}

        {audioBlob && (
          <button
            onClick={resetRecording}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>{t('voiceRecorder.recordAgain', 'Record Again')}</span>
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {t('voiceRecorder.playback', 'Playback')}
          </h4>
          <audio 
            controls 
            src={audioUrl}
            className="w-full"
          >
            {t('voiceRecorder.audioNotSupported', 'Your browser does not support audio playback.')}
          </audio>
        </div>
      )}

      {/* Recording Info */}
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>
          {t('voiceRecorder.maxDuration', 'Maximum duration')}: {formatTime(maxDuration)}
        </p>
        <p>
          {t('voiceRecorder.format', 'Format')}: WebM (Opus)
        </p>
      </div>
    </div>
  );
};

export default AdvancedVoiceRecorder;