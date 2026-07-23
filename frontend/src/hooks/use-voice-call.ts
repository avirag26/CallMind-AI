import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type VoiceState = 'Disconnected' | 'Connecting' | 'Listening' | 'Thinking' | 'Speaking' | 'Error';

export function useVoiceCall(callId: string) {
  const [status, setStatus] = useState<VoiceState>('Disconnected');
  const [transcript, setTranscript] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [partial, setPartial] = useState('');
  const [patientState, setPatientState] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Must be called directly inside the onClick handler to satisfy browser gesture rules
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtx.resume();
      audioContextRef.current = audioCtx;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setStatus('Connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;

      const socket = io('http://localhost:4000/voice');
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('start-session', { callId });
        setStatus('Listening');
      });

      socket.on('voice-state', (state: any) => {
        if (state.status === 'Interrupted') {
          // Barge-in: stop playback
          if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
          }
          isPlayingRef.current = false;
          setStatus('Listening');
          if (state.partial) setPartial(state.partial);
          return;
        }

        if (state.status) setStatus(state.status as VoiceState);
        if (state.partial) setPartial(state.partial);
        
        if (state.final) {
          setPartial('');
          setTranscript(prev => [...prev, { role: 'user', text: state.final }]);
        }
        
        if (state.aiResponse) {
          setTranscript(prev => [...prev, { role: 'ai', text: state.aiResponse }]);
        }
        
        if (state.patientState) {
          setPatientState(state.patientState);
        }
      });

      socket.on('audio-chunk', async (buffer: ArrayBuffer) => {
        try {
          if (!audioContextRef.current) return;
          const audioData = await audioContextRef.current.decodeAudioData(buffer);
          playAudioData(audioData);
        } catch (e) {
          console.error('Error decoding audio chunk', e);
        }
      });

      inputNodeRef.current = audioCtx.createMediaStreamSource(stream);
      processorRef.current = audioCtx.createScriptProcessor(4096, 1, 1);
      
      inputNodeRef.current.connect(processorRef.current);
      processorRef.current.connect(audioCtx.destination);
      
      processorRef.current.onaudioprocess = (e) => {
        if (isMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);
        
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        if (socketRef.current?.connected) {
          socketRef.current.emit('audio-stream', pcmData.buffer);
        }
      };

    } catch (err) {
      console.error(err);
      setStatus('Error');
    }
  }, [callId, isMuted]);

  const playAudioData = (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      sourceNodeRef.current = null;
      isPlayingRef.current = false;
    };
    
    sourceNodeRef.current = source;
    isPlayingRef.current = true;
    source.start(0);
  };

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('end-session');
      socketRef.current.disconnect();
    }
    if (processorRef.current && inputNodeRef.current) {
      inputNodeRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setStatus('Disconnected');
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    status,
    transcript,
    partial,
    patientState,
    isMuted,
    initAudio,
    connect,
    disconnect,
    toggleMute
  };
}
