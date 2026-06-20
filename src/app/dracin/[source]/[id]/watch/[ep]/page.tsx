import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DracinPlayer from '../../../../components/DracinPlayer';

interface EpisodeItem {
  episodeNumber: number;
  episodeTitle: string;
  locked: boolean;
  number: number;
  title: string;
  videoUrl: string;
}

interface DramaDetail {
  id: string;
  dramaId?: string;
  title: string;
  cover: string;
  posterImg?: string;
  episodes: EpisodeItem[];
  totalEpisodes: number;
  isCompleted: string;
  defaultLanguage?: string;
  description?: string;
  synopsis?: string;
}

interface EpisodeStreamData {
  code: number;
  episodeNumber: number;
  locked: boolean;
  msg: string;
  number: number;
  videoUrl: string;
}

interface WatchPageProps {
  params: Promise<{ source: string; id: string; ep: string }>;
}

export async function generateMetadata({ params }: WatchPageProps) {
  const { source, id, ep } = await params;
  try {
    const res = await fetch(`https://api.anichin.bio/${source}/detail?id=${id}`, {
      headers: {
        'X-API-Key': 'TRIAL-ANICHIN-2026',
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 1800 }
    });
    if (!res.ok) return { title: 'Nonton Drama - PisNime Flix' };
    const rawData = await res.json();
    const drama = rawData.data || rawData;
    
    const displayTitle = drama.title || `Drama #${id}`;
    
    return {
      title: `Nonton ${displayTitle} Episode ${ep} Subtitle Indonesia - PisNime Flix`,
      description: `Streaming drama ${displayTitle} Episode ${ep} dengan sub Indo gratis di PisNime Flix.`,
    };
  } catch {
    return { title: 'Nonton Drama - PisNime Flix' };
  }
}

export default async function DracinWatchPage({ params }: WatchPageProps) {
  const { source, id, ep } = await params;
  const epNum = parseInt(ep, 10);

  if (isNaN(epNum) || epNum <= 0) {
    notFound();
  }

  let drama: DramaDetail | null = null;
  let epStream: EpisodeStreamData | null = null;

  try {
    // 1. Fetch details for metadata and playlist sidebar
    const detailRes = await fetch(`https://api.anichin.bio/${source}/detail?id=${id}`, {
      headers: {
        'X-API-Key': 'TRIAL-ANICHIN-2026',
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 1800 }
    });

    if (detailRes.ok) {
      const rawData = await detailRes.json();
      drama = rawData.data || rawData;
    }

    // 2. Fetch specific episode streaming data
    const epRes = await fetch(`https://api.anichin.bio/${source}/episode?id=${id}&ep=${epNum}`, {
      headers: {
        'X-API-Key': 'TRIAL-ANICHIN-2026',
        'User-Agent': 'Mozilla/5.0'
      },
      next: { revalidate: 1800 }
    });

    if (epRes.ok) {
      epStream = await epRes.json();
    }
  } catch (err) {
    console.error('Error fetching stream data on SSR:', err);
  }

  if (!drama) {
    notFound();
  }

  const dramaTitle = drama.title || `Drama #${id}`;
  const episodesList = drama.episodes || [];
  const currentIndex = episodesList.findIndex(e => (e.episodeNumber || e.number) === epNum);
  
  const prevEpisode = currentIndex > 0 ? episodesList[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodesList.length - 1 ? episodesList[currentIndex + 1] : null;

  const displaySource = source.charAt(0).toUpperCase() + source.slice(1);

  return (
    <div className="min-h-screen py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80 mb-6">
          <Link href="/" className="text-decoration-none text-inherit hover:text-white transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href="/dracin" className="text-decoration-none text-inherit hover:text-white transition-colors">Katalog Dracin</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href={`/dracin/${source}/${id}`} className="text-decoration-none text-inherit hover:text-white transition-colors">{dramaTitle}</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">Nonton Episode {epNum}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Player Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Player Container */}
            {epStream?.locked ? (
              <div className="player-wrapper relative overflow-hidden bg-black rounded-2xl border border-red-500/20 aspect-video flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-red-500 text-6xl mb-4 animate-bounce">lock</span>
                <h3 className="text-white font-bold text-lg mb-2">Episode Terkunci</h3>
                <p className="text-on-surface-variant text-sm max-w-md">
                  Maaf, episode ini terkunci oleh platform resmi. Silakan coba episode lainnya yang tersedia.
                </p>
              </div>
            ) : epStream?.videoUrl ? (
              <DracinPlayer videoUrl={epStream.videoUrl} />
            ) : (
              <div className="player-wrapper relative overflow-hidden bg-black rounded-2xl border border-white/5 aspect-video flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-6xl mb-4">error</span>
                <h3 className="text-white font-bold text-lg mb-2">Streaming Gagal</h3>
                <p className="text-on-surface-variant text-sm max-w-md">
                  Gagal memuat alamat video streaming. Episode ini mungkin belum dirilis atau sedang mengalami gangguan teknis.
                </p>
              </div>
            )}

            {/* Video Info and Navigation */}
            <div className="bg-surface-container/20 border border-white/5 p-6 rounded-2xl space-y-6 backdrop-blur-md">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary mb-1 block">
                  {displaySource} &bull; Episode {epNum}
                </span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white">
                  {dramaTitle} - Episode {epNum}
                </h1>
              </div>

              {/* Navigation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                <Link
                  href={prevEpisode && !prevEpisode.locked ? `/dracin/${source}/${id}/watch/${prevEpisode.episodeNumber || prevEpisode.number}` : '#'}
                  className={`text-decoration-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    prevEpisode && !prevEpisode.locked
                      ? 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30 active:scale-95 cursor-pointer'
                      : 'opacity-40 pointer-events-none bg-surface-container-high/20 border-transparent'
                  }`}
                  aria-disabled={!prevEpisode || prevEpisode.locked}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Episode Sebelumnya
                </Link>

                <Link
                  href={`/dracin/${source}/${id}`}
                  className="text-decoration-none px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container-high text-on-surface border border-white/5 hover:border-primary/30 transition-all active:scale-95 cursor-pointer"
                >
                  Detail Drama
                </Link>

                <Link
                  href={nextEpisode && !nextEpisode.locked ? `/dracin/${source}/${id}/watch/${nextEpisode.episodeNumber || nextEpisode.number}` : '#'}
                  className={`text-decoration-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    nextEpisode && !nextEpisode.locked
                      ? 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30 active:scale-95 cursor-pointer'
                      : 'opacity-40 pointer-events-none bg-surface-container-high/20 border-transparent'
                  }`}
                  aria-disabled={!nextEpisode || nextEpisode.locked}
                >
                  Episode Selanjutnya
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Episode List Column */}
          <div className="space-y-6">
            <div className="bg-surface-container/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col max-h-[70vh]">
              <h2 className="font-display-md text-sm md:text-base font-bold text-white mb-4 flex items-center gap-2 pb-3 border-b border-white/5">
                <span className="material-symbols-outlined text-primary text-lg">playlist_play</span>
                Daftar Episode
              </h2>

              {episodesList.length === 0 ? (
                <p className="text-on-surface-variant text-xs italic">Episode lainnya tidak ditemukan.</p>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
                  {episodesList.map((epItem) => {
                    const itemNum = epItem.episodeNumber || epItem.number;
                    const isActive = itemNum === epNum;
                    const isLocked = epItem.locked;
                    
                    return (
                      <Link
                        key={itemNum}
                        href={`/dracin/${source}/${id}/watch/${itemNum}`}
                        className={`text-decoration-none flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                          isActive
                            ? 'bg-primary/20 border-primary text-primary'
                            : isLocked
                              ? 'bg-surface-container-high/20 hover:bg-primary/10 border-white/5 text-on-surface-variant/60 hover:text-white'
                              : 'bg-surface-container-high/40 hover:bg-primary/10 border-white/5 text-on-surface-variant hover:text-white'
                        }`}
                      >
                        <span>Episode {itemNum}</span>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        ) : isLocked ? (
                          <span className="material-symbols-outlined text-[10px] text-on-surface-variant/50">lock</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
