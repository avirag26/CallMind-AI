'use client';

import { useEffect, useState } from 'react';

type CallStatus = 'RINGING' | 'ANSWERED' | 'MISSED' | 'REJECTED' | 'AI_ACTIVE' | 'COMPLETED' | 'FAILED';

interface Call {
  id: string;
  phoneNumber: string;
  patientName: string;
  status: CallStatus;
  startedAt: string;
  timeoutAt: string;
}

export function CallCard({ call, onAnswer, onReject, onEnd }: { 
  call: Call; 
  onAnswer: (id: string) => void; 
  onReject: (id: string) => void;
  onEnd: (id: string) => void;
}) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (call.status !== 'RINGING') return;
    
    const timeout = new Date(call.timeoutAt).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((timeout - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [call.status, call.timeoutAt]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{call.patientName || 'Unknown Patient'}</h3>
          <p className="text-muted-foreground">{call.phoneNumber}</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
          {call.status}
        </div>
      </div>
      
      {call.status === 'RINGING' && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Time to answer</p>
          <p className="text-3xl font-mono font-bold text-destructive">{timeLeft}s</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {call.status === 'RINGING' && (
          <>
            <button onClick={() => onAnswer(call.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition-colors">
              Answer
            </button>
            <button onClick={() => onReject(call.id)} className="flex-1 bg-destructive hover:bg-destructive/90 text-white py-2 rounded-md font-medium transition-colors">
              Reject
            </button>
          </>
        )}
        {(call.status === 'ANSWERED' || call.status === 'AI_ACTIVE') && (
          <button onClick={() => onEnd(call.id)} className="w-full bg-destructive hover:bg-destructive/90 text-white py-2 rounded-md font-medium transition-colors">
            End Call
          </button>
        )}
        {call.status === 'AI_ACTIVE' && (
          <a href={`/dashboard/calls/${call.id}/ai`} className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition-colors">
            Join AI Session
          </a>
        )}
      </div>
    </div>
  );
}
