'use client';

import { useState } from 'react';
import { useVoiceCall } from '@/hooks/use-voice-call';

export default function LiveVoiceCallPage() {
  const [callId, setCallId] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  
  const { 
    status, 
    transcript, 
    partial, 
    patientState, 
    isMuted, 
    connect, 
    disconnect, 
    toggleMute 
  } = useVoiceCall(callId);

  const handleStart = async () => {
    setIsRinging(true);
    
    // Simulate phone ringing for 5 seconds
    setTimeout(async () => {
      setIsRinging(false);
      
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
      }, 500);
    }, 10000);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsStarted(false);
    setIsRinging(false);
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
            isRinging ? 'bg-emerald-400' :
            status === 'Listening' ? 'bg-emerald-500' :
            status === 'Thinking' ? 'bg-amber-500' :
            status === 'Speaking' ? 'bg-blue-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            {isRinging ? 'RINGING' : status}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-6 gap-6">
        
        {/* Left Column: Visualizer & Controls */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient glowing orb effect based on status */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-all duration-700 ${
              isRinging ? 'bg-emerald-400 animate-ping' :
              status === 'Listening' ? 'bg-emerald-500 scale-110' :
              status === 'Thinking' ? 'bg-amber-500 animate-pulse' :
              status === 'Speaking' ? 'bg-blue-500 scale-125' : 'bg-gray-500'
            }`} />

            <div className="z-10 text-center space-y-8">
              {!isStarted && !isRinging ? (
                <button 
                  onClick={handleStart}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Start Live Call
                </button>
              ) : isRinging ? (
                <div className="text-2xl font-medium text-emerald-400 animate-pulse h-8">
                  Ringing...
                </div>
              ) : (
                <>
                  <div className={`text-xl font-medium text-gray-300 h-8 ${status === 'Listening' ? 'animate-pulse' : ''}`}>
                    {status === 'Listening' ? 'Speak now...' : status === 'Thinking' ? 'Processing...' : status === 'Speaking' ? 'AI is speaking...' : ''}
                  </div>
                  
                  <div className="flex gap-4 justify-center mt-12">
                    <button 
                      onClick={toggleMute}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                      {isMuted ? '🔇' : '🎤'}
                    </button>
                    <button 
                      onClick={handleDisconnect}
                      className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                      🛑
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transcript & Live JSON */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Transcript */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 flex-1 flex flex-col max-h-[400px]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Live Transcript</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/30' 
                      : 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {partial && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-gray-700/30 text-gray-400 border border-gray-600/30 italic">
                    {partial}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live JSON State */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 flex-1 max-h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Live Extracted State</h3>
            <div className="bg-gray-900/80 rounded-xl p-4 flex-1 overflow-y-auto font-mono text-sm text-emerald-400 border border-gray-800">
              {patientState ? (
                <pre>{JSON.stringify(patientState, null, 2)}</pre>
              ) : (
                <div className="text-gray-600 h-full flex items-center justify-center">
                  State will appear here after your first response...
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
