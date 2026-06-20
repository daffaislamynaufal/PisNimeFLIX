'use client';

import { useEffect, useRef } from 'react';

interface DracinPlayerProps {
  videoUrl: string;
}

export default function DracinPlayer({ videoUrl }: DracinPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: import('hls.js').default | null = null;

    // Dynamically import hls.js to prevent Server-Side Rendering (SSR) errors
    import('hls.js').then(({ default: Hls }) => {
      if (!videoRef.current) return;
      
      const currentVideo = videoRef.current;

      if (Hls.isSupported()) {
        hlsInstance = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(currentVideo);
      } else if (currentVideo.canPlayType('application/vnd.apple.mpegurl')) {
        currentVideo.src = videoUrl;
      }
    }).catch((err) => {
      console.error('Failed to load hls.js dynamically:', err);
    });

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [videoUrl]);

  return (
    <div className="player-wrapper relative overflow-hidden bg-black rounded-2xl border border-primary/10 neon-glow aspect-video">
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        playsInline
      />
    </div>
  );
}
