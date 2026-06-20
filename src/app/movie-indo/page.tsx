import React from 'react';
import Link from 'next/link';
import { getMovieIndoCatalog } from '@/lib/movie-indo';
import MovieSearch from './MovieSearch';

interface CatalogPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export const metadata = {
  title: 'Nonton Film Indonesia Terbaru - PisNime Flix',
  description: 'Streaming film Indonesia terbaru dan terpopuler kualitas HD subtitle bahasa Indonesia gratis tanpa iklan.',
};

export default async function MovieIndoPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageVal = isNaN(page) || page <= 0 ? 1 : page;
  const qVal = params.q || '';

  const { items, hasMore } = await getMovieIndoCatalog(pageVal, qVal);

  const buildPageUrl = (targetPage: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(targetPage));
    if (qVal) {
      queryParams.set('q', qVal);
    }
    return `/movie-indo?${queryParams.toString()}`;
  };

  return (
    <div className="min-h-screen py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display-lg text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight">
              Film Indonesia
            </h1>
            <p className="text-xs text-on-surface-variant font-medium">
              Koleksi film Indonesia terpopuler dan rilisan terbaru gratis kualitas HD.
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-auto bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Halaman {pageVal}</span>
          </div>
        </div>

        {/* Search Bar Component */}
        <MovieSearch key={qVal} initialQuery={qVal} />

        {/* Movies Grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">
              {qVal ? 'search_off' : 'movie'}
            </span>
            <h3 className="text-white font-bold text-lg mb-2">Film Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm max-w-md">
              {qVal 
                ? `Maaf, kami tidak dapat menemukan film yang cocok dengan kata kunci "${qVal}". Silakan coba cari dengan kata kunci lain.`
                : 'Gagal memuat daftar film Indonesia atau halaman yang Anda cari kosong. Silakan kembali ke halaman pertama.'
              }
            </p>
            <Link
              href="/movie-indo"
              className="text-decoration-none mt-6 px-6 py-2.5 rounded-xl font-bold text-xs bg-primary text-white hover:opacity-90 active:scale-95 transition-all"
            >
              {qVal ? 'Hapus Pencarian' : 'Halaman Pertama'}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {items.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie-indo/${movie.id}`}
                  className="text-decoration-none group flex flex-col gap-3 active:scale-[0.98] transition-transform duration-300"
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-high/40 border border-white/5 shadow-lg group-hover:border-primary/30 group-hover:shadow-primary/5 transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movie.cover || '/placeholder.jpg'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-60 group-hover:opacity-85 transition-opacity"></div>
                    
                    {/* Play Hover Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg shadow-primary/20 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <span className="material-symbols-outlined text-2xl">play_arrow</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {movie.title}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant/80 font-medium">Film Indonesia</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-16 pt-6 border-t border-white/5">
              <Link
                href={pageVal > 1 ? buildPageUrl(pageVal - 1) : '#'}
                className={`text-decoration-none px-5 py-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  pageVal > 1
                    ? 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30 active:scale-95 cursor-pointer'
                    : 'opacity-40 pointer-events-none bg-surface-container-high/20 border-transparent'
                }`}
                aria-disabled={pageVal <= 1}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Sebelumnya
              </Link>

              <span className="text-xs text-on-surface-variant font-bold px-4 py-2 rounded-lg bg-surface-container/40 border border-white/5">
                Hal {pageVal}
              </span>

              <Link
                href={hasMore ? buildPageUrl(pageVal + 1) : '#'}
                className={`text-decoration-none px-5 py-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  hasMore
                    ? 'bg-surface-container-high text-on-surface border-white/5 hover:border-primary/30 active:scale-95 cursor-pointer'
                    : 'opacity-40 pointer-events-none bg-surface-container-high/20 border-transparent'
                }`}
                aria-disabled={!hasMore}
              >
                Selanjutnya
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
