'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PcmAudioController } from '@/lib/audio/pcm-recorder';
import {
  playCallStartSound,
  playCallEndSound,
} from '@/lib/audio/interface-sounds';

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

  const wsRef = useRef<WebSocket | null>(null);
  const audioControllerRef = useRef<PcmAudioController | null>(null);
  const isMutedRef = useRef(isMuted);
  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock acquired successfully');
      }
    } catch (err) {
      console.warn('Failed to acquire Screen Wake Lock:', err);
    }
  };

  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock released successfully');
      }
    } catch (err) {
      console.error('Failed to release Screen Wake Lock:', err);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isConnectedRef.current) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  // Track real-time transcripts separately so we can edit them dynamically
  const currentTurnTextRef = useRef<{ user: string; assistant: string }>({
    user: '',
    assistant: '',
  });

  // Track committed messages of previous turns to avoid repetition bugs
  const committedMessagesRef = useRef<LiveMessage[]>([]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const clearNudgeTimer = useCallback(() => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  }, []);

  const startNudgeTimer = useCallback(() => {
    clearNudgeTimer();
    nudgeTimerRef.current = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const nudgePayload = {
          realtimeInput: {
            text: '[System: Người dùng đã im lặng hơn 7 giây kể từ câu trả lời của bạn. Hãy chủ động gợi ý tiếp câu chuyện hoặc hỏi xem họ có cần giúp đỡ gì không bằng một câu nói ngắn gọn.]',
          },
        };
        wsRef.current.send(JSON.stringify(nudgePayload));
      }
    }, 7000);
  }, [clearNudgeTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const cleanupSession = () => {
    clearNudgeTimer();
    releaseWakeLock();
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioControllerRef.current) {
      audioControllerRef.current.stopRecording();
      audioControllerRef.current.cleanupPlayback();
      audioControllerRef.current = null;
    }
    if (isConnectedRef.current) {
      playCallEndSound();
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsThinking(false);
    setMicLevel(0);
    setSpeakerLevel(0);
  };

  const startSession = useCallback(
    async (scenarioTitle: string, systemPrompt: string) => {
      if (isConnecting || isConnected) return;
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      currentTurnTextRef.current = { user: '', assistant: '' };
      committedMessagesRef.current = [];

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
              realtimeInputConfig: {
                automaticActivityDetection: {
                  disabled: false,
                  silenceDurationMs: 1500, // Wait 1.5 seconds of silence before thinking user finished speaking
                },
              },
            },
          };
          ws.send(JSON.stringify(setupPayload));
        };

        ws.onmessage = async (event) => {
          let messageData = '';
          if (typeof Blob !== 'undefined' && event.data instanceof Blob) {
            messageData = await event.data.text();
          } else if (typeof event.data === 'string') {
            messageData = event.data;
          } else {
            return;
          }

          try {
            const response = JSON.parse(messageData);

            // Handle setup complete
            if (response.setupComplete) {
              // 5. Start recording audio now that setup is complete
              try {
                // Request Wake Lock to prevent screen sleep
                requestWakeLock();

                await controller.startRecording((base64PCM) => {
                  if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
                    // Suppress sending mic data if the speaker is currently playing AI audio
                    // to prevent echo feedback loop / self-interruption.
                    if (controller.isPlaying()) {
                      return;
                    }
                    const audioPayload = {
                      realtimeInput: {
                        audio: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64PCM,
                        },
                      },
                    };
                    ws.send(JSON.stringify(audioPayload));
                  }
                });

                setIsConnected(true);
                setIsConnecting(false);
                playCallStartSound();

                // Set a hard timeout of 10 minutes (600,000 ms) to limit token usage and duration
                if (sessionTimeoutRef.current)
                  clearTimeout(sessionTimeoutRef.current);
                sessionTimeoutRef.current = setTimeout(
                  () => {
                    setError(
                      'Cuộc trò chuyện đã tự động kết thúc sau 10 phút để tối ưu hóa hiệu năng và bảo vệ lượng token.'
                    );
                    endSession();
                  },
                  10 * 60 * 1000
                );

                // Send an initial silent nudge to trigger the AI to start speaking first
                const initialNudge = {
                  clientContent: {
                    turns: [
                      {
                        role: 'user',
                        parts: [
                          {
                            text: 'Hello. Please initiate the conversation according to your role instructions.',
                          },
                        ],
                      },
                    ],
                    turnComplete: true,
                  },
                };
                ws.send(JSON.stringify(initialNudge));
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
              clearNudgeTimer();
              return;
            }

            // B: Receive model audio stream
            if (serverContent.modelTurn?.parts) {
              clearNudgeTimer();
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
              clearNudgeTimer();
              const transcriptText = serverContent.inputTranscription.text;

              // Regex detects East Asian scripts: Korean (Hangul), Japanese (Hiragana/Katakana), Chinese (Hanzi/Kanji)
              const hasForeignScript =
                /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(
                  transcriptText
                );

              if (hasForeignScript) {
                currentTurnTextRef.current.user = '[Lỗi nhận diện âm thanh]';
              } else if (
                currentTurnTextRef.current.user !== '[Lỗi nhận diện âm thanh]'
              ) {
                currentTurnTextRef.current.user += transcriptText;
              }
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
              startNudgeTimer();
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

    const currentMessages: LiveMessage[] = [];
    if (userText) {
      currentMessages.push({ role: 'user', text: userText });
    }
    if (assistantText) {
      currentMessages.push({ role: 'assistant', text: assistantText });
    }

    setTranscript([...committedMessagesRef.current, ...currentMessages]);
  };

  const commitCurrentTurn = () => {
    const userText = currentTurnTextRef.current.user.trim();
    const assistantText = currentTurnTextRef.current.assistant.trim();

    if (userText || assistantText) {
      const turnMessages: LiveMessage[] = [];
      if (userText) {
        turnMessages.push({ role: 'user', text: userText });
      }
      if (assistantText) {
        turnMessages.push({ role: 'assistant', text: assistantText });
      }

      committedMessagesRef.current = [
        ...committedMessagesRef.current,
        ...turnMessages,
      ];
      setTranscript(committedMessagesRef.current);
      currentTurnTextRef.current = { user: '', assistant: '' };
    }
  };

  const endSession = useCallback(() => {
    commitCurrentTurn();
    cleanupSession();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (nextMuted) {
        clearNudgeTimer();
      } else {
        if (isConnected) {
          startNudgeTimer();
        }
      }
      return nextMuted;
    });
  }, [isConnected, clearNudgeTimer, startNudgeTimer]);

  return {
    isConnected,
    isConnecting,
    error,
    transcript,
    micLevel,
    speakerLevel,
    isMuted,
    isThinking,
    startSession,
    endSession,
    toggleMute,
  };
}
