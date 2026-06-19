'use client';

import { useState } from 'react';

interface MirrorItem {
  quality: string;
  provider: string;
  content: string;
}

interface WatchPlayerProps {
  defaultStreamingUrl: string;
  initialStreamingUrl: string;
  initialQuality: string;
  initialProvider: string;
  mirrors: MirrorItem[];
  episodeId: string;
  title: string;
}

export default function WatchPlayer({
  defaultStreamingUrl,
  initialStreamingUrl,
  initialQuality,
  initialProvider,
  mirrors,
  episodeId,
  title
}: WatchPlayerProps) {
  const [currentSrc, setCurrentSrc] = useState(initialStreamingUrl);
  const [loading, setLoading] = useState(false);
  const [activeQuality, setActiveQuality] = useState<string>(initialQuality);
  const [activeProvider, setActiveProvider] = useState<string>(initialProvider);

  // Group mirrors by quality
  const groupedMirrors = mirrors.reduce((acc, mirror) => {
    if (!acc[mirror.quality]) {
      acc[mirror.quality] = [];
    }
    acc[mirror.quality].push(mirror);
    return acc;
  }, {} as Record<string, MirrorItem[]>);

  const handleSelectMirror = async (mirror: MirrorItem) => {
    setLoading(true);
    setActiveQuality(mirror.quality);
    setActiveProvider(mirror.provider);
    
    try {
      const response = await fetch('/api/episode/mirror', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: mirror.content,
          episodeId,
        }),
      });

      const result = await response.json();
      if (result.src) {
        setCurrentSrc(result.src);
      } else {
        alert('Gagal memuat mirror video ini. Silakan coba provider lain.');
      }
    } catch (error) {
      console.error('Error switching mirror:', error);
      alert('Terjadi kesalahan saat memuat server video.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDefault = () => {
    setCurrentSrc(defaultStreamingUrl);
    setActiveQuality('360p');
    setActiveProvider('default');
  };

  return (
    <div className="space-y-6">
      {/* Video Player Container */}
      <div className="player-wrapper relative overflow-hidden bg-black rounded-2xl border border-primary/10 neon-glow aspect-video">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-10">
            <div className="loading-spinner"></div>
            <p className="text-sm font-semibold text-primary mt-4 animate-pulse">Menghubungkan ke server streaming...</p>
          </div>
        )}
        
        {currentSrc ? (
          <iframe
            src={currentSrc}
            className="player-iframe w-full h-full border-none"
            allowFullScreen
            scrolling="no"
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-on-surface-variant font-medium">
            Pemutar video tidak tersedia.
          </div>
        )}
      </div>

      {/* Quality & Server Selector Panel */}
      <div className="bg-surface-container/40 border border-white/5 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-on-surface font-bold flex items-center gap-2 text-base">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
              Server / Kualitas Video
            </h3>
            <p className="text-xs text-on-surface-variant">Jika video lemot atau tidak berputar, silakan ganti kualitas atau server di bawah.</p>
          </div>

          {/* Quick Active Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="text-xs font-semibold text-primary uppercase">
              Aktif: {activeQuality} ({activeProvider === 'default' ? 'Default' : activeProvider})
            </span>
          </div>
        </div>

        <div className="grid gap-4 pt-2">
          {/* Default 360p Server */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Kualitas SD (360p)</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectDefault}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  activeQuality === '360p' && activeProvider === 'default'
                    ? 'bg-primary text-on-primary border-transparent shadow-lg shadow-primary/25'
                    : 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30'
                }`}
              >
                DesuStream (Default)
              </button>
            </div>
          </div>

          {/* Scraped Qualities */}
          {Object.entries(groupedMirrors).map(([quality, items]) => (
            <div key={quality} className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Kualitas {quality === '720p' ? 'HD (720p)' : `Medium (${quality})`}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => {
                  const isActive = activeQuality === quality && activeProvider === item.provider;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectMirror(item)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-primary text-on-primary border-transparent shadow-lg shadow-primary/25'
                          : 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30'
                      }`}
                    >
                      {item.provider}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
