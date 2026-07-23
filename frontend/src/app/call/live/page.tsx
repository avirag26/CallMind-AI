'use client';

import { useState } from 'react';
import { useVoiceCall } from '@/hooks/use-voice-call';

export default function LiveVoiceCallPage() {
  const [callId, setCallId] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  
  const { 
    status, 
    isMuted, 
    initAudio,
    connect, 
    disconnect, 
    toggleMute 
  } = useVoiceCall(callId);

  const handleStart = async () => {
    // 1. Initialize audio synchronously on user click to bypass browser autoplay blocks
    initAudio();
    
    // Generate a fresh mock call ID for this live session
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/calls/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: 'LIVE_WEB', patientName: 'Web Caller' })
    });
    const call = await res.json();
    setCallId(call.id);
    setIsStarted(true);
    
    // Wait for React to update state, then connect the socket
    setTimeout(async () => {
      await connect();
    }, 100);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          CallMind Voice
        </h1>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            status === 'Listening' ? 'bg-emerald-500' :
            status === 'Thinking' ? 'bg-amber-500' :
            status === 'Speaking' ? 'bg-blue-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            {status}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 justify-center">
        
        <div className="flex-1 flex flex-col gap-6 items-center justify-center">
          <div className="w-full max-w-2xl bg-gray-800/50 border border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden aspect-video shadow-2xl">
            {/* Ambient glowing orb effect based on status */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none transition-all duration-700 ${
              status === 'Listening' ? 'bg-emerald-500 scale-110' :
              status === 'Thinking' ? 'bg-amber-500 animate-pulse' :
              status === 'Speaking' ? 'bg-blue-500 scale-125' : 'bg-gray-500'
            }`} />

            <div className="relative z-10 text-center space-y-8 w-full">
              {!isStarted ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <span className="text-4xl">📞</span>
                  </div>
                  <h2 className="text-3xl font-light text-gray-200">Ready to consult?</h2>
                  <button 
                    onClick={handleStart}
                    className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-xl transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  >
                    Start Call
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-12">
                  <div className={`text-2xl font-light text-gray-300 h-10 ${status === 'Listening' ? 'animate-pulse' : ''}`}>
                    {status === 'Connecting' ? 'Connecting to clinic...' :
                     status === 'Listening' ? 'Listening...' : 
                     status === 'Thinking' ? 'Consulting wellness team...' : 
                     status === 'Speaking' ? 'Receptionist is speaking...' : ''}
                  </div>
                  
                  <div className="flex gap-6 justify-center">
                    <button 
                      onClick={toggleMute}
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' : 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg'}`}
                    >
                      {isMuted ? '🔇' : '🎤'}
                    </button>
                    <button 
                      onClick={handleDisconnect}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-105"
                    >
                      🛑
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
