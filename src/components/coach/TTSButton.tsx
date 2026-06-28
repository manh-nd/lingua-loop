'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
  variant?: 'ghost' | 'outline' | 'default' | 'secondary';
  title?: string;
}

// Split text into chunks of max 200 characters without breaking words/sentences
function splitTextIntoChunks(text: string, maxLen: number = 200): string[] {
  const cleanText = text
    .replace(/[*_`~#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length <= maxLen) return [cleanText];

  const chunks: string[] = [];
  let remaining = cleanText;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = -1;
    const subStr = remaining.substring(0, maxLen);

    const lastSentenceEnd = Math.max(
      subStr.lastIndexOf('. '),
      subStr.lastIndexOf('? '),
      subStr.lastIndexOf('! ')
    );

    if (lastSentenceEnd > 0) {
      splitIndex = lastSentenceEnd + 1;
    } else {
      const lastComma = Math.max(
        subStr.lastIndexOf(', '),
        subStr.lastIndexOf('; ')
      );
      if (lastComma > 0) {
        splitIndex = lastComma + 1;
      } else {
        const lastSpace = subStr.lastIndexOf(' ');
        if (lastSpace > 0) {
          splitIndex = lastSpace;
        } else {
          splitIndex = maxLen;
        }
      }
    }

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

export function TTSButton({
  text,
  className,
  size = 'icon-xs',
  variant = 'ghost',
  title = 'Phát âm',
}: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef<number>(0);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNextChunk = () => {
    if (currentChunkIndexRef.current >= chunksRef.current.length) {
      setIsPlaying(false);
      return;
    }

    try {
      const chunk = chunksRef.current[currentChunkIndexRef.current];
      const encodedText = encodeURIComponent(chunk);
      const url = `/api/tts?text=${encodedText}`;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        currentChunkIndexRef.current += 1;
        playNextChunk();
      };

      audio.onerror = () => {
        console.error(
          'Failed to load Edge TTS proxy audio for chunk index:',
          currentChunkIndexRef.current
        );
        setIsPlaying(false);
      };

      audio.play().catch((err) => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
    } catch (err) {
      console.error('TTS playback chunk error:', err);
      setIsPlaying(false);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If currently playing, stop it
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    try {
      // Split the current text input into small server-friendly chunks
      const textToPlay = text || '';
      chunksRef.current = splitTextIntoChunks(textToPlay);
      currentChunkIndexRef.current = 0;

      if (chunksRef.current.length === 0) return;

      setIsPlaying(true);
      playNextChunk();
    } catch (err) {
      console.error('TTS execution error:', err);
      setIsPlaying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePlay}
      title={title}
      className={cn(
        'relative transition-all duration-200 active:scale-95 shrink-0',
        isPlaying
          ? 'text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {isPlaying ? (
        <VolumeX className="size-3.5 animate-pulse" />
      ) : (
        <Volume2 className="size-3.5" />
      )}
      <span className="sr-only">{title}</span>
    </Button>
  );
}
