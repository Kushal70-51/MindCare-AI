'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AiVoiceOrb } from '../ui/AiVoiceOrb';
import { CameraPreview } from '../ui/CameraPreview';
import { AudioVisualizer } from '../ui/AudioVisualizer';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Settings,
  Maximize2,
  Volume2,
  Send,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AssessmentInterfaceScreen: React.FC = () => {
  const {
    setScreen,
    questions,
    currentQuestionIndex,
    goToQuestion,
    recordAnswer,
    cameraOn,
    toggleCamera,
    micMuted,
    toggleMic,
    backgroundBlur,
    toggleBackgroundBlur,
    showToast,
  } = useApp();

  const currentQ = questions[currentQuestionIndex];
  const [userInput, setUserInput] = useState('');
  const [aiMode, setAiMode] = useState<'speaking' | 'listening' | 'thinking'>('speaking');
  const [transcript, setTranscript] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isFullScreenVideo, setIsFullScreenVideo] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Web Speech Synthesis
  useEffect(() => {
    if (!currentQ) return;

    setAiMode('speaking');

    setTranscript((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: currentQ.aiVoicePrompt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.aiVoicePrompt);
      utterance.rate = 0.95;
      utterance.onend = () => setAiMode('listening');
      window.speechSynthesis.speak(utterance);
    } else {
      const timer = setTimeout(() => setAiMode('listening'), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex]);

  // Continuous Speech-to-Text (STT) Auto-Typing Engine
  useEffect(() => {
    if (micMuted) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let liveTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          liveTranscript += event.results[i][0].transcript;
        }
        if (liveTranscript) {
          // Auto-type what the user talks directly into the input answer field!
          setUserInput(liveTranscript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('STT Error:', err);
      };

      recognition.onend = () => {
        // Auto-restart if mic is still unmuted
        if (!micMuted) {
          try {
            recognition.start();
          } catch (e) {}
        } else {
          setIsListening(false);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn(e);
      }

      return () => {
        try {
          recognition.stop();
        } catch (e) {}
      };
    }
  }, [micMuted, currentQuestionIndex]);

  const handleSendAnswer = (textToSend?: string) => {
    const finalAnswer = textToSend || userInput;
    if (!finalAnswer.trim()) return;

    setTranscript((prev) => [
      ...prev,
      {
        sender: 'user',
        text: finalAnswer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    recordAnswer(finalAnswer);
    setUserInput('');
    setAiMode('thinking');

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
      } else {
        showToast('Assessment Completed!');
        setScreen('completed');
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 py-4 text-white flex flex-col justify-between min-h-[calc(100vh-80px)] space-y-4">
      {/* Top Header Stepper */}
      <div className="flex items-center justify-between bg-slate-950/90 border border-white/15 px-6 py-3.5 rounded-3xl backdrop-blur-2xl shadow-xl z-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black px-4 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-bold text-slate-200 hidden sm:inline">
            Domain: {currentQ.domain}
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/10 p-0.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => currentQuestionIndex > 0 && goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 disabled:opacity-30 hover:bg-slate-700 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => currentQuestionIndex < questions.length - 1 && goToQuestion(currentQuestionIndex + 1)}
            disabled={currentQuestionIndex === questions.length - 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 disabled:opacity-30 hover:bg-slate-700 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Video Stage with Overlay Rectangle Question & Floating AI Avatar */}
      <div className="relative w-full flex-1 rounded-3xl overflow-hidden border-2 border-teal-500/40 bg-slate-950 shadow-2xl min-h-[580px] sm:min-h-[660px] flex flex-col justify-between">
        {/* Full Viewport Video Stage */}
        <div className="absolute inset-0 z-0">
          <CameraPreview
            cameraOn={cameraOn}
            onToggleCamera={toggleCamera}
            backgroundBlur={backgroundBlur}
            onToggleBlur={toggleBackgroundBlur}
            isFullScreen={isFullScreenVideo}
            onToggleFullScreen={() => setIsFullScreenVideo((prev) => !prev)}
          />
        </div>

        {/* Floating Rectangle Question Card on Top of Video */}
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 mt-4 mx-auto w-11/12 max-w-3xl bg-slate-950/85 backdrop-blur-2xl border-2 border-teal-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-teal-400 border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI Clinical Prompt #{currentQ.id}</span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {currentQ.category}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug pt-1">
            "{currentQ.questionText}"
          </h2>
        </motion.div>

        {/* Floating AI Avatar & Voice Status Overlay */}
        <div className="absolute top-28 right-6 z-20 hidden md:flex flex-col items-center p-4 rounded-3xl bg-slate-950/80 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-3 max-w-[240px]">
          <AiVoiceOrb mode={aiMode} size="sm" />
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
            <Volume2 className={`w-3.5 h-3.5 ${aiMode === 'speaking' ? 'text-teal-400 animate-pulse' : 'text-slate-400'}`} />
            <span>
              {aiMode === 'speaking' ? 'AI Speaking...' : isListening ? 'Listening & Auto-Typing...' : 'Thinking...'}
            </span>
          </div>
        </div>

        {/* Floating Live Conversation Transcript Log */}
        <div className="absolute bottom-6 left-6 z-20 hidden lg:flex flex-col p-4 rounded-3xl bg-slate-950/85 border border-white/20 backdrop-blur-2xl shadow-2xl w-80 max-h-56 overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-white/10 pb-2 mb-2">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Live Transcript</span>
          </div>
          <div className="overflow-y-auto space-y-2 text-xs pr-1">
            {transcript.slice(-3).map((t, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl text-xs ${
                  t.sender === 'ai'
                    ? 'bg-blue-950/60 border border-blue-500/30 text-slate-200'
                    : 'bg-teal-950/60 border border-teal-500/30 text-teal-100'
                }`}
              >
                <span className="font-bold text-[10px] block text-slate-400">{t.sender === 'ai' ? 'MindCare AI' : 'You'}</span>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Control Bar with Camera/Mic Buttons, Sound Waves & Real-Time Auto-Typed Input */}
      <div className="w-full bg-slate-950/95 border-2 border-white/20 p-4 rounded-3xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl z-20">
        {/* Left Section: Live Session Status */}
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e]" />
          <span className="text-sm font-bold text-slate-200 hidden xl:inline">
            Multimodal Assessment Session
          </span>
        </div>

        {/* Center Section: Camera & Mic Buttons + Sound Waves Right Next to Buttons */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-3xl border border-white/15">
          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-2xl border transition-all ${
              !cameraOn
                ? 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-600/30'
                : 'bg-slate-800 border-white/20 text-slate-200 hover:text-white'
            }`}
            title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {!cameraOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl border transition-all ${
              micMuted
                ? 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-600/30'
                : 'bg-slate-800 border-white/20 text-slate-200 hover:text-white'
            }`}
            title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Sound Waves Spectrum Visualizer RIGHT NEXT to Camera & Mic Buttons */}
          <div className="px-2">
            <AudioVisualizer
              isRecording={!micMuted}
              barCount={22}
              height={44}
              isSpeaking={aiMode === 'speaking' || isListening}
            />
          </div>

          <button
            onClick={() => setScreen('completed')}
            className="p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden lg:inline">End Session</span>
          </button>
        </div>

        {/* Right Section: Speech Auto-Typed Answer Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendAnswer();
          }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder={isListening ? 'Listening... Speak to auto-type answer' : 'Speak or type answer here...'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className={`w-full px-4 py-3 bg-slate-900 border rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none font-medium transition-all ${
                isListening ? 'border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.3)]' : 'border-white/20 focus:border-teal-400'
              }`}
            />
            {isListening && (
              <span className="absolute right-3 top-3.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
            )}
          </div>

          <button
            type="submit"
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-slate-950 font-black hover:shadow-xl hover:shadow-teal-500/30 transition-all"
            title="Submit Answer"
          >
            <Send className="w-5 h-5 fill-slate-950" />
          </button>
        </form>
      </div>
    </div>
  );
};
