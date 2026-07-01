'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PcmAudioController } from '@/lib/audio/pcm-recorder';
import {
  playCallStartSound,
  playCallEndSound,
} from '@/lib/audio/interface-sounds';
import { LiveMode, LiveTopic, LiveScenario } from '@/core/live/live-modes';
import { hasForeignScript } from '@/core/live/live-utils';
import { buildLiveSystemPrompt } from '@/core/live/live-prompt-builder';

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

  const [activeMode, setActiveMode] = useState<LiveMode | null>(null);
  const [activeTopic, setActiveTopic] = useState<LiveTopic | null>(null);
  const [activeScenario, setActiveScenario] = useState<LiveScenario | null>(
    null
  );

  const wsRef = useRef<WebSocket | null>(null);
  const audioControllerRef = useRef<PcmAudioController | null>(null);
  const isMutedRef = useRef(isMuted);
  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const sessionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock acquired successfully');
      }
    } catch (err) {
      console.warn('Failed to acquire Screen Wake Lock:', err);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock released successfully');
      }
    } catch (err) {
      console.error('Failed to release Screen Wake Lock:', err);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isConnectedRef.current) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [requestWakeLock]);

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
            text: '[System: Người dùng đã im lặng hơn 7 giây. Tùy vào vai trò của bạn, hãy: dạy 1 từ vựng hoặc idiom liên quan đến chủ đề đang nói, hoặc gợi ý tiếp câu chuyện, hoặc hỏi user có muốn thử nói lại câu nào không. Giữ ngắn gọn và tự nhiên.]',
          },
        };
        wsRef.current.send(JSON.stringify(nudgePayload));
      }
    }, 7000);
  }, [clearNudgeTimer]);

  const cleanupSession = useCallback(() => {
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
    setActiveMode(null);
    setActiveTopic(null);
    setActiveScenario(null);
  }, [clearNudgeTimer, releaseWakeLock]);

  const updateTranscriptUi = useCallback(() => {
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
  }, []);

  const commitCurrentTurn = useCallback(() => {
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
  }, []);

  const endSession = useCallback(() => {
    commitCurrentTurn();
    cleanupSession();
  }, [commitCurrentTurn, cleanupSession]);

  const startSession = useCallback(
    async (config: {
      mode: LiveMode;
      topic?: LiveTopic;
      scenario?: LiveScenario;
    }) => {
      if (isConnecting || isConnected) return;
      setIsConnecting(true);
      setError(null);
      setTranscript([]);
      currentTurnTextRef.current = { user: '', assistant: '' };
      committedMessagesRef.current = [];
      sessionStartTimeRef.current = Date.now();

      const { mode, topic, scenario } = config;
      setActiveMode(mode);
      setActiveTopic(topic || null);
      setActiveScenario(scenario || null);

      // Build system prompt using the prompt builder utility
      let systemPrompt = buildLiveSystemPrompt({
        mode,
        topic: topic || undefined,
        scenario: scenario || undefined,
        voiceName: options.voiceName || 'Aoede',
      });

      try {
        // Fetch ephemeral token and learning profile concurrently
        const [tokenRes, profileRes] = await Promise.all([
          fetch('/api/live/token'),
          fetch('/api/live/learning-profile').catch(() => null),
        ]);

        if (!tokenRes.ok) {
          throw new Error('Failed to fetch authentication token.');
        }
        const tokenData = await tokenRes.json();
        if (tokenData.error || !tokenData.token) {
          throw new Error(tokenData.error || 'No token returned from server.');
        }

        // Parse learning profile if valid
        if (profileRes && profileRes.ok) {
          try {
            const profileData = await profileRes.json();
            let learningProfilePrompt = '';
            if (
              (profileData.commonMistakes &&
                profileData.commonMistakes.length > 0) ||
              (profileData.activeVocab && profileData.activeVocab.length > 0)
            ) {
              learningProfilePrompt =
                '\n\n## User Learning Profile (Cá nhân hóa)\n';
              if (
                profileData.commonMistakes &&
                profileData.commonMistakes.length > 0
              ) {
                learningProfilePrompt +=
                  'Lỗi sai phổ biến của người dùng này (hãy chú ý bắt lỗi và sửa nếu họ lặp lại):\n';
                profileData.commonMistakes.forEach((item: any) => {
                  learningProfilePrompt += `- Tránh nói: "${item.originalText}" -> Hãy nói đúng: "${item.correctedText}"\n`;
                });
              }
              if (
                profileData.activeVocab &&
                profileData.activeVocab.length > 0
              ) {
                learningProfilePrompt +=
                  '\nTừ vựng/cách diễn đạt native họ đang học (hãy tạo cơ hội hoặc khuyến khích họ dùng):\n';
                profileData.activeVocab.forEach((item: any) => {
                  learningProfilePrompt += `- Cụm từ: "${item.correctedText}" (nghĩa: "${item.originalText}")\n`;
                });
              }
              systemPrompt += learningProfilePrompt;
            }
          } catch (profileErr) {
            console.error('Failed to parse learning profile:', profileErr);
          }
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
              outputAudioTranscription: {},
              realtimeInputConfig: {
                automaticActivityDetection: {
                  disabled: false,
                  silenceDurationMs: 2500, // Wait 2.5 seconds of silence before thinking user finished speaking
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
                await requestWakeLock();

                await controller.startRecording((base64PCM, rms) => {
                  if (ws.readyState === WebSocket.OPEN && !isMutedRef.current) {
                    const elapsedMs = Date.now() - sessionStartTimeRef.current;

                    // 1. Initial warm-up (first 3.5 seconds): block microphone transmission
                    // to let WebRTC echo cancellation converge and AI greeting finish.
                    if (elapsedMs < 3500) {
                      return;
                    }

                    // 2. While AI is speaking: only send audio if the user is actually speaking
                    // (volume exceeds the threshold), allowing normal user barge-in while blocking echo.
                    if (controller.isPlaying()) {
                      if (rms < 0.03) {
                        return; // Ignore low-level echo/noise
                      }
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

              // Check if input contains foreign non-Latin scripts (Arabic, Chinese, Japanese, Korean, Thai, Hindi, Cyrillic, etc.)
              const hasForeign = hasForeignScript(transcriptText);

              if (hasForeign) {
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
      } catch (err: unknown) {
        console.error('Failed to start Live session:', err);
        setError(
          err instanceof Error ? err.message : 'Lỗi khởi tạo phòng Live.'
        );
        cleanupSession();
      }
    },
    [
      isConnecting,
      isConnected,
      options.voiceName,
      requestWakeLock,
      cleanupSession,
      commitCurrentTurn,
      clearNudgeTimer,
      startNudgeTimer,
      updateTranscriptUi,
      endSession,
    ]
  );

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  return {
    isConnected,
    isConnecting,
    error,
    transcript,
    micLevel,
    speakerLevel,
    isMuted,
    isThinking,
    activeMode,
    activeTopic,
    activeScenario,
    startSession,
    endSession,
    toggleMute,
  };
}
