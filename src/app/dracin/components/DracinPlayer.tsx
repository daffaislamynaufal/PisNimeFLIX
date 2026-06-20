'use client';

import { useEffect, useRef, useState } from 'react';

interface DracinPlayerProps {
  videoUrl: string;
}

export default function DracinPlayer({ videoUrl }: DracinPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: import('hls.js').default | null = null;
    setIsLoading(true);

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleLoadedData = () => setIsLoading(false);
    const handleSeeking = () => setIsLoading(true);
    const handleSeeked = () => setIsLoading(false);

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    // Dynamically import hls.js to prevent Server-Side Rendering (SSR) errors
    import('hls.js').then(({ default: Hls }) => {
      if (!videoRef.current) return;
      
      const currentVideo = videoRef.current;

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30, // Buffer up to 30 seconds ahead
          maxMaxBufferLength: 60, // Maximum buffer up to 60 seconds
          maxBufferSize: 60 * 1024 * 1024, // Limit buffer size to 60MB to save memory
          progressive: true,
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(currentVideo);
      } else if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
        currentVideo.src = videoUrl;
      }
    }).catch((err) => {
      console.error('Failed to load hls.js dynamically:', err);
      setIsLoading(false);
    });

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoUrl]);

  return (
    <div className="player-wrapper relative overflow-hidden bg-black rounded-2xl border border-primary/10 neon-glow aspect-video flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[4px] pointer-events-none">
          <div className="w-10 h-10 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/30 animate-spin mb-3"></div>
          <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Memuat aliran video...</span>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        playsInline
      />
    </div>
  );
}
