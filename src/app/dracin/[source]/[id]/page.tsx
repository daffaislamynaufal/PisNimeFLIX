import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const ANICHIN_API_KEY = process.env.ANICHIN_API_KEY || 'TRIAL-ANICHIN-2026';

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
  viewCount?: number;
  msg?: string;
  code?: number;
}

interface DetailPageProps {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: DetailPageProps) {
  const { source, id } = await params;
  try {
    const res = await fetch(`https://api.anichin.bio/${source}/detail?id=${id}`, {
      headers: {
        'X-API-Key': ANICHIN_API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 1800 }
    });
    
    if (!res.ok) return { title: 'Detail Drama - PisNime Flix' };
    
    const rawData = await res.json();
    const data = rawData.data || rawData;
    
    if (!data) {
      return { title: 'Drama Tidak Ditemukan - PisNime Flix' };
    }
    
    const displayTitle = data.title || `Drama #${id}`;
    
    return {
      title: `${displayTitle} Subtitle Indonesia - PisNime Flix`,
      description: data.synopsis ? data.synopsis.slice(0, 160) : `Nonton short drama ${displayTitle} gratis dengan subtitle Bahasa Indonesia di PisNime Flix.`,
    };
  } catch {
    return { title: 'Detail Drama - PisNime Flix' };
  }
}

export default async function DracinDetailPage({ params }: DetailPageProps) {
  const { source, id } = await params;

  let detailData: DramaDetail | null = null;
  try {
    const res = await fetch(`https://api.anichin.bio/${source}/detail?id=${id}`, {
      headers: {
        'X-API-Key': ANICHIN_API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 1800 }
    });
    if (res.ok) {
      const rawData = await res.json();
      detailData = rawData.data || rawData;
    }
  } catch (err) {
    console.error('Error fetching drama details on SSR:', err);
  }

  if (!detailData) {
    notFound();
  }

  const drama = detailData;
  const dramaTitle = drama.title || `Drama #${id}`;
  const coverUrl = drama.posterImg || drama.cover || '/placeholder.jpg';
  const displaySource = source.charAt(0).toUpperCase() + source.slice(1);
  const statusLabel = drama.isCompleted === '1' ? 'Tamat' : 'Ongoing';
  const totalEps = drama.totalEpisodes || drama.episodes?.length || 0;

  return (
    <div className="min-h-screen relative py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${coverUrl})` }}
      ></div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80 mb-8">
          <Link href="/" className="text-decoration-none text-inherit hover:text-white transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href="/dracin" className="text-decoration-none text-inherit hover:text-white transition-colors">Katalog Dracin</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">{dramaTitle}</span>
        </div>

        {/* Drama Info Header */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          {/* Cover Art Box */}
          <div className="w-full sm:w-64 flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-surface-container-high/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={dramaTitle}
                className="w-full h-full object-cover object-top"
              />
            </div>
            
            {/* Quick Watch Button */}
            {drama.episodes && drama.episodes.length > 0 && !drama.episodes[0].locked && (
              <Link
                href={`/dracin/${source}/${id}/watch/${drama.episodes[0].episodeNumber || drama.episodes[0].number || 1}`}
                className="text-decoration-none mt-4 w-full primary-gradient py-3.5 rounded-xl font-bold text-xs text-white text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Nonton Episode 1
              </Link>
            )}
          </div>

          {/* Info Details Box */}
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider border border-primary/30 bg-primary/10 text-primary uppercase">
                {displaySource}
              </span>
              <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider border uppercase ${
                drama.isCompleted === '1' 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}>
                {statusLabel}
              </span>
            </div>

            <h1 className="font-display-lg text-2xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              {dramaTitle}
            </h1>

            {/* Metadata Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-surface-container/20 border border-white/5 rounded-2xl p-5 mb-6 backdrop-blur-md">
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Total Episode</span>
                <span className="text-xs text-white font-bold">{totalEps} Episode</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Bahasa Utama</span>
                <span className="text-xs text-white font-bold">{drama.defaultLanguage?.toUpperCase() || 'ID'}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Total View</span>
                <span className="text-xs text-white font-bold">{drama.viewCount?.toLocaleString() || 0} Kali</span>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="font-bold text-sm text-white mb-2">Sinopsis</h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed max-w-4xl whitespace-pre-line bg-surface-container/10 p-4 rounded-xl border border-white/5">
                {drama.synopsis || drama.description || 'Belum ada sinopsis untuk drama ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Episode Playlist Section */}
        <div className="bg-surface-container/20 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
          <h2 className="font-display-md text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">playlist_play</span>
            Daftar Episode
          </h2>

          {!drama.episodes || drama.episodes.length === 0 ? (
            <p className="text-on-surface-variant text-sm italic">Belum ada episode yang tersedia.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {drama.episodes.map((ep) => {
                const epNum = ep.episodeNumber || ep.number;
                
                return (
                  <Link
                    key={epNum}
                    href={`/dracin/${source}/${id}/watch/${epNum}`}
                    className={`text-decoration-none px-4 py-3 rounded-xl flex items-center justify-between transition-all font-bold text-xs active:scale-95 cursor-pointer border ${
                      ep.locked
                        ? 'bg-surface-container-high/20 border-white/5 text-on-surface-variant/60 hover:border-primary/20 hover:bg-primary/5 hover:text-white'
                        : 'bg-surface-container-high/40 hover:bg-primary/20 border-outline-variant/30 hover:border-primary/40 text-white'
                    }`}
                  >
                    <span>Eps {epNum}</span>
                    {ep.locked && (
                      <span className="material-symbols-outlined text-[10px] text-on-surface-variant/50">lock</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
