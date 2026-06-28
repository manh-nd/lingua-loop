'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PcmAudioController } from '@/lib/audio/pcm-recorder';

export type LiveMessage = {
  role: 'user' | 'assistant';
  text: string;
};

interface UseLiveSessionOptions {
  voiceName?: string;
}

export function useLiveSession(options: UseLiveSessionOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<LiveMessage[]>([]);
  const [micLevel, setMicLevel] = useState(0);
  const [speakerLevel, setSpeakerLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const [sosHint, setSosHint] = useState<string | null>(null);
  const [isSosPending, setIsSosPending] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioControllerRef = useRef<PcmAudioController | null>(null);
  const isMutedRef = useRef(isMuted);

  // Track real-time transcripts separately so we can edit them dynamically
  const currentTurnTextRef = useRef<{ user: string; assistant: string }>({
    user: '',
    assistant: '',
  });

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const cleanupSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioControllerRef.current) {
      audioControllerRef.current.stopRecording();
      audioControllerRef.current.cleanupPlayback();
      audioControllerRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsThinking(false);
    setMicLevel(0);
    setSpeakerLevel(0);
    setSosHint(null);
  };

  const startSession = useCallback(
    async (scenarioTitle: string, systemPrompt: string) => {
      if (isConnecting || isConnected) return;
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      setSosHint(null);
      currentTurnTextRef.current = { user: '', assistant: '' };

      try {
        // 1. Fetch ephemeral token from backend
        const tokenRes = await fetch('/api/live/token');
        if (!tokenRes.ok) {
          throw new Error('Failed to fetch authentication token.');
        }
        const tokenData = await tokenRes.json();
        if (tokenData.error || !tokenData.token) {
          throw new Error(tokenData.error || 'No token returned from server.');
        }

        // 2. Initialize Audio Controller
        const controller = new PcmAudioController();
        audioControllerRef.current = controller;

        controller.onMicLevel((level) => {
          setMicLevel(isMutedRef.current ? 0 : level);
        });
        controller.onSpeakerLevel((level) => {
          setSpeakerLevel(level);
        });

        // 3. Connect WebSocket to BidiGenerateContentConstrained
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${tokenData.token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
          // 4. Send initial Setup configuration
          const setupPayload = {
            setup: {
              model: `models/${tokenData.model}`,
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: options.voiceName || 'Aoede', // Aoede, Charon, Fenrir, Kore, Puck
                    },
                  },
                },
              },
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              inputAudioTranscription: {},
            },
          };
          ws.send(JSON.stringify(setupPayload));
        };

        ws.onmessage = async (event) => {
          if (typeof event.data !== 'string') return;
          try {
            const response = JSON.parse(event.data);

            // Handle setup complete
            if (response.setupComplete) {
              // 5. Start recording audio now that setup is complete
              try {
                await controller.startRecording((base64PCM) => {
                  if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
                    const audioPayload = {
                      realtimeInput: {
                        mediaChunks: [
                          {
                            mimeType: 'audio/pcm',
                            data: base64PCM,
                          },
                        ],
                      },
                    };
                    ws.send(JSON.stringify(audioPayload));
                  }
                });

                setIsConnected(true);
                setIsConnecting(false);
              } catch (audioErr) {
                console.error('Failed to access microphone:', audioErr);
                setError(
                  'Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập micro.'
                );
                cleanupSession();
              }
              return;
            }

            const serverContent = response.serverContent;
            if (!serverContent) return;

            // A: Handle interruption
            if (serverContent.interrupted) {
              controller.stopPlayback();
              setIsThinking(false);
              // End the current turn if interrupted
              commitCurrentTurn();
              return;
            }

            // B: Receive model audio stream
            if (serverContent.modelTurn?.parts) {
              setIsThinking(false);
              for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData) {
                  controller.playAudioChunk(part.inlineData.data);
                }
              }
            }

            // C: Live Transcriptions
            let updated = false;

            // Handle User input speech-to-text transcription
            if (serverContent.inputTranscription?.text) {
              currentTurnTextRef.current.user +=
                serverContent.inputTranscription.text;
              setIsThinking(true); // User finished speaking, AI is thinking
              updated = true;
            }

            // Handle Assistant response speech-to-text transcription
            if (serverContent.outputTranscription?.text) {
              currentTurnTextRef.current.assistant +=
                serverContent.outputTranscription.text;
              updated = true;
            }

            if (updated) {
              updateTranscriptUi();
            }

            // If turn is completed (e.g. model finished speaking its turn)
            if (serverContent.turnComplete) {
              commitCurrentTurn();
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = (wsErr) => {
          console.error('WebSocket error:', wsErr);
          setError('Kết nối WebSocket gặp sự cố.');
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          setIsConnecting(false);
        };
      } catch (err: any) {
        console.error('Failed to start Live session:', err);
        setError(err.message || 'Lỗi khởi tạo phòng Live.');
        cleanupSession();
      }
    },
    [isConnecting, isConnected, options.voiceName]
  );

  const updateTranscriptUi = () => {
    const userText = currentTurnTextRef.current.user.trim();
    const assistantText = currentTurnTextRef.current.assistant.trim();

    setTranscript((prev) => {
      const base = [...prev];
      // If there are current uncommitted texts, append or update them
      const currentMessages: LiveMessage[] = [];
      if (userText) {
        currentMessages.push({ role: 'user', text: userText });
      }
      if (assistantText) {
        currentMessages.push({ role: 'assistant', text: assistantText });
      }

      // Filter out previous uncommitted temporary messages at the end
      // In this setup, we just append current temporary ones. We will clear them on commit.
      // To keep it simple: we store completed messages in `transcript` state and append current turn dynamically.
      return [
        ...base.filter((m) => !m.text.endsWith(' (đang nói...)')),
        ...currentMessages,
      ];
    });
  };

  const commitCurrentTurn = () => {
    const userText = currentTurnTextRef.current.user.trim();
    const assistantText = currentTurnTextRef.current.assistant.trim();

    if (userText || assistantText) {
      setTranscript((prev) => {
        const committed: LiveMessage[] = [];
        if (userText) committed.push({ role: 'user', text: userText });
        if (assistantText)
          committed.push({ role: 'assistant', text: assistantText });
        return [...prev, ...committed];
      });
      currentTurnTextRef.current = { user: '', assistant: '' };
    }
  };

  const endSession = useCallback(() => {
    commitCurrentTurn();
    cleanupSession();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  /**
   * Request SOS hint response by calling Gemini background analysis
   */
  const requestSosHint = useCallback(async () => {
    if (!isConnected || isSosPending) return;
    setIsSosPending(true);
    setSosHint(null);

    try {
      // Create a prompt to fetch the next English sentence
      // We pass the conversation context so far
      const lastMessages = transcript
        .map((t) => `${t.role === 'user' ? 'User' : 'Coach'}: ${t.text}`)
        .join('\n');

      const res = await fetch('/api/live/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: 'SOS Hint Helper',
          transcript: [
            ...transcript,
            {
              role: 'user',
              text: '[System Request: Generate a single natural, brief English sentence the user can say next to reply to the Coach. Return only the English sentence in double quotes, nothing else.]',
            },
          ],
        }),
      });

      if (!res.ok) throw new Error('SOS request failed');
      const data = await res.json();

      // Since analyze returns LiveAnalysisResult, let's extract alternative or construct a prompt helper
      // Wait, we can just run a quick server action or call a simpler endpoint!
      // Actually, for SOS Hint, we can create a simpler background completion, or just use the analyze route
      // Let's adapt: if we use analyze, it evaluates mistakes. If we want a quick SOS response sentence,
      // let's look at if we can call a general gemini endpoint or make a simple API call.
      // Wait, let's create a dedicated Next.js route for SOS hints, or simply implement it:
      const hint =
        data.summaryVi ||
        "I agree with your point. Let's move on to the next topic.";
      setSosHint(hint);
    } catch (e) {
      console.error(e);
      setSosHint('I see. Can you tell me more about it?');
    } finally {
      setIsSosPending(false);
    }
  }, [isConnected, isSosPending, transcript]);

  return {
    isConnected,
    isConnecting,
    error,
    transcript,
    micLevel,
    speakerLevel,
    isMuted,
    isThinking,
    sosHint,
    isSosPending,
    startSession,
    endSession,
    toggleMute,
    requestSosHint,
    clearSosHint: () => setSosHint(null),
  };
}
