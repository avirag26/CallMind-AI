'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Send, PhoneOff, FileText, Loader2, Mic, MicOff, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  speaker: string;
  text: string;
  createdAt: string;
}

export default function AiSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const isContinuousListeningRef = useRef(true);
  const isSpeakingRef = useRef(false);
  const isTypingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasSpokenInitialRef = useRef(false);
  
  // Streaming state
  const [streamText, setStreamText] = useState('');

  const fetchConversation = async () => {
    try {
      const res = await api.get(`/ai/conversation/${id}`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error('Failed to fetch conversation', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/ai/summary/${id}`);
      if (res.data) setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch summary', error);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchConversation();
    fetchSummary();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  // Auto-speak initial greeting for new calls
  useEffect(() => {
    if (messages.length === 1 && messages[0].speaker !== 'USER' && !hasSpokenInitialRef.current) {
      hasSpokenInitialRef.current = true;
      // Slight delay to ensure speech synthesis is ready
      setTimeout(() => {
        speakText(messages[0].text, true);
      }, 500);
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Set to false to avoid echo loops
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          // Get the latest result
          const lastIndex = event.results.length - 1;
          const transcript = event.results[lastIndex][0].transcript;
          
          setInput(transcript);
          
          // Stop listening while we send and process to prevent echo
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
          }

          // Automatically send after transcribing
          handleSendText(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.error('Speech recognition error', event.error);
          }
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Restart if we are in continuous mode and not currently processing or speaking
          const hasSpeechQueued = typeof window !== 'undefined' && 'speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
          
          if (isContinuousListeningRef.current && !isTypingRef.current && !isSpeakingRef.current && !hasSpeechQueued) {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch (e) {
              console.error('Failed to auto-restart recognition:', e);
            }
          }
        };
        
        // Auto-start listening on mount
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error('Failed to auto-start recognition on mount:', e);
        }
      }
    }
    
    return () => {
      isContinuousListeningRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  const toggleListening = () => {
    if (isContinuousListening) {
      // Turn off continuous listening
      isContinuousListeningRef.current = false;
      setIsContinuousListening(false);
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Turn on continuous listening
      isContinuousListeningRef.current = true;
      setIsContinuousListening(true);
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        }
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string, clearQueue = false) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (clearQueue) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      // Prioritize known female voices across Windows, Mac, and Google Chrome
      const preferredVoice = voices.find(v => 
        v.name.includes('Zira') || 
        v.name.includes('Samantha') || 
        v.name.toLowerCase().includes('female')
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        // Stop listening while AI speaks to prevent echo
        if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
        }
      };
      
      utterance.onend = () => {
        // If there are no more utterances in the queue, we are done speaking
        if (window.speechSynthesis.pending === false) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          
          // Resume listening if continuous mode is on and we are not typing
          if (isContinuousListeningRef.current && !isTypingRef.current) {
            try {
              recognitionRef.current?.start();
              setIsListening(true);
            } catch(e) {}
          }
        }
      };
      
      utterance.onerror = () => {
        if (window.speechSynthesis.pending === false) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendText = async (userMsgText: string) => {
    if (!userMsgText.trim()) return;
    
    setInput('');
    setIsTyping(true);
    isTypingRef.current = true;
    setStreamText('');
    
    // Stop listening while processing
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    // Stop any ongoing speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Optimistically add user message
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), speaker: 'USER', text: userMsgText, createdAt: new Date().toISOString() }
    ]);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/ai/message/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsgText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalAiText = '';
      let spokenLength = 0;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        const lines = chunkValue.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  finalAiText += data.text;
                  setStreamText(finalAiText);
                  
                  // Extract and speak sentences as they are formed
                  const unscannedText = finalAiText.substring(spokenLength);
                  // Match anything up to a punctuation mark followed by space or newline
                  const sentenceMatch = unscannedText.match(/^(.*?[.!?])(\s|\n|$)/);
                  if (sentenceMatch) {
                    const sentenceToSpeak = sentenceMatch[1];
                    speakText(sentenceToSpeak, false); // false = do not clear queue
                    spokenLength += sentenceMatch[0].length;
                  }
                }
                if (data.done) {
                  fetchConversation();
                  setStreamText('');
                  
                  // Speak any remaining text that didn't end in punctuation
                  const remaining = finalAiText.substring(spokenLength).trim();
                  if (remaining.length > 0) {
                    speakText(remaining, false);
                  }
                }
              } catch(e) {}
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted.');
      } else {
        console.error('Failed to send message', error);
      }
    } finally {
      setIsTyping(false);
      isTypingRef.current = false;
      
      const hasSpeechQueued = typeof window !== 'undefined' && 'speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
      
      // If we finished processing and no speech is queued or playing, resume listening
      if (isContinuousListeningRef.current && !hasSpeechQueued && !isSpeakingRef.current) {
        try {
          recognitionRef.current?.start();
          setIsListening(true);
        } catch (e) {}
      }
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendText(input);
  };

  const handleEndConversation = async () => {
    setIsGeneratingSummary(true);
    isContinuousListeningRef.current = false;
    setIsContinuousListening(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      await api.post(`/ai/end/${id}`);
      await fetchSummary();
      await fetchConversation(); // Sync up anything
    } catch (error) {
      console.error('Failed to end and summarize', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Left Chat Pane */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} ${!isListening && !isTyping ? 'animate-pulse' : ''}`} />
            {isListening ? 'Listening...' : isTyping ? 'AI Thinking...' : 'AI Session Active'}
          </h2>
          <div className="flex items-center gap-4">
            {isContinuousListening && (
               <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full animate-pulse border border-red-200">
                 Always On Mode
               </span>
            )}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
                <Volume2 className="w-4 h-4" />
                Speaking
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-muted/5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.speaker === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                msg.speaker === 'USER' ? 'bg-primary text-primary-foreground' : 
                msg.speaker === 'system' ? 'bg-muted text-muted-foreground text-sm' :
                'bg-card border border-border'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {streamText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-card border border-border shadow-sm">
                <p className="whitespace-pre-wrap">{streamText}</p>
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1 align-middle" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleFormSubmit} className="p-4 border-t border-border bg-card flex gap-2 items-center">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full flex items-center justify-center transition-all shadow-sm transform hover:scale-105 active:scale-95 ${
              isContinuousListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/20' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title={isContinuousListening ? 'Stop continuous listening' : 'Start continuous listening'}
          >
            {isContinuousListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={isListening ? "Listening continuously... (Speak to interrupt)" : "Type or click the mic to talk..."}
            className="flex-1 bg-background border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center min-w-[40px] transition-transform active:scale-95"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Right Info Pane */}
      <div className="w-[400px] flex flex-col gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
            Actions
          </h3>
          <button
            onClick={handleEndConversation}
            disabled={isGeneratingSummary}
            className="w-full flex items-center justify-center gap-2 bg-destructive text-white py-3 rounded-lg hover:bg-destructive/90 transition-all active:scale-95 disabled:opacity-50 font-medium"
          >
            {isGeneratingSummary ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Summary...</>
            ) : (
              <><PhoneOff className="w-5 h-5" /> End & Summarize</>
            )}
          </button>
        </div>

        {summary && (
          <div className="flex-1 bg-card border border-border rounded-xl p-6 overflow-y-auto shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Structured Summary
            </h3>
            
            <div className="space-y-4 text-sm">
              {Object.entries(summary).map(([key, value]) => {
                if (['id', 'conversationId', 'createdAt', 'updatedAt'].includes(key) || !value) return null;
                return (
                  <div key={key} className="border-b border-border/50 pb-2">
                    <span className="text-muted-foreground uppercase text-xs font-bold block mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-foreground">{value as React.ReactNode}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

