'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { CallCard } from '@/components/calls/call-card';
import { useWebSocket } from '@/hooks/use-websocket';

export default function CallsPage() {
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const socket = useWebSocket();

  const fetchCalls = async () => {
    try {
      const res = await api.get('/calls/active');
      setActiveCalls(res.data);
    } catch (error) {
      console.error('Failed to fetch active calls', error);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('CALL_CREATED', (call) => {
      setActiveCalls((prev) => [call, ...prev]);
    });
    
    socket.on('CALL_UPDATED', (call) => {
      setActiveCalls((prev) => prev.map((c) => c.id === call.id ? call : c));
    });
    
    socket.on('CALL_ENDED', (call) => {
      setActiveCalls((prev) => prev.filter((c) => c.id !== call.id));
    });
    
    socket.on('AI_STARTED', (call) => {
      setActiveCalls((prev) => prev.map((c) => c.id === call.id ? call : c));
    });

    return () => {
      socket.off('CALL_CREATED');
      socket.off('CALL_UPDATED');
      socket.off('CALL_ENDED');
      socket.off('AI_STARTED');
    };
  }, [socket]);

  const handleAnswer = async (id: string) => {
    await api.post(`/calls/${id}/answer`);
  };

  const handleReject = async (id: string) => {
    await api.post(`/calls/${id}/reject`);
  };

  const handleEnd = async (id: string) => {
    await api.post(`/calls/${id}/end`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incoming & Active Calls</h1>
        <p className="text-muted-foreground">Manage your calls in real-time.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeCalls.length === 0 ? (
          <div className="col-span-full rounded-md border border-border p-12 text-center text-muted-foreground bg-card">
            No active calls at the moment.
          </div>
        ) : (
          activeCalls.map((call) => (
            <CallCard 
              key={call.id} 
              call={call} 
              onAnswer={handleAnswer} 
              onReject={handleReject} 
              onEnd={handleEnd} 
            />
          ))
        )}
      </div>
    </div>
  );
}
