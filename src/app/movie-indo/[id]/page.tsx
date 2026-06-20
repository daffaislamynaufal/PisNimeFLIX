import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovieIndoDetail } from '@/lib/movie-indo';
import MoviePlayer from './MoviePlayer';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps) {
  const { id } = await params;
  try {
    const movie = await getMovieIndoDetail(id);
    if (!movie) return { title: 'Nonton Film - PisNime Flix' };
    
    return {
      title: `Nonton ${movie.title} Subtitle Indonesia - PisNime Flix`,
      description: movie.description || `Streaming film Indonesia ${movie.title} gratis kualitas HD subtitle Bahasa Indonesia di PisNime Flix.`,
    };
  } catch {
    return { title: 'Nonton Film - PisNime Flix' };
  }
}

export default async function MovieWatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const movie = await getMovieIndoDetail(id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[100px] opacity-15 pointer-events-none"
        style={{ backgroundImage: `url(${movie.cover})` }}
      ></div>

      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80 mb-8">
          <Link href="/" className="text-decoration-none text-inherit hover:text-white transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href="/movie-indo" className="text-decoration-none text-inherit hover:text-white transition-colors">Film Indonesia</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">{movie.title}</span>
        </div>

        {/* Video Player Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-6">
            <MoviePlayer videoUrl={movie.videoUrl} />

            {/* Movie Info */}
            <div className="bg-surface-container/20 border border-white/5 p-6 rounded-2xl space-y-6 backdrop-blur-md">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary mb-1.5 block">
                  Film Indonesia &bull; Pilihan Terbaik
                </span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white">
                  {movie.title}
                </h1>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="font-bold text-sm text-white mb-2">Sinopsis</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed max-w-4xl whitespace-pre-line bg-surface-container/10 p-4 rounded-xl border border-white/5">
                  {movie.description || 'Belum ada sinopsis untuk film ini.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            <div className="bg-surface-container/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex flex-col gap-6">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={movie.cover} 
                  alt={movie.title} 
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Status</span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md inline-block uppercase tracking-wider">
                    Full Movie
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Bahasa</span>
                  <span className="text-xs text-white font-bold">Bahasa Indonesia</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Kategori</span>
                  <span className="text-xs text-white font-bold">Film Indonesia / Drama Indonesia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
