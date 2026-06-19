import { searchAnime } from '@/lib/scraper';
import React from 'react';

export const revalidate = 3600; // Cache for 1 hour since movie lists change slowly

export default async function MoviesPage() {
  // Fetch movie data dynamically
  const allResults = await searchAnime('Movie');
  
  // Filter for real movies / film releases
  const moviesList = allResults.filter(item => 
    item.title.toLowerCase().includes('movie') ||
    item.title.toLowerCase().includes('zero') ||
    item.title.toLowerCase().includes('na wa') ||
    item.title.toLowerCase().includes('film') ||
    item.title.toLowerCase().includes('koe no') ||
    item.title.toLowerCase().includes('tenki') ||
    item.title.toLowerCase().includes('kizumonogatari')
  );

  return (
    <div className="space-y-12">
      {/* Movies Cinematic Hero Banner */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="relative w-full h-[450px] md:h-[550px] rounded-xl overflow-hidden group shadow-2xl border border-white/5">
          {/* Backdrop Image - Kimi no Na wa Style aesthetic */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqGSDJ7X9oCqarotns5gTavrrUguvhiJe3mLOOPfXRUKjUql-0RB-mLDawNMJsY-KUyvw3Qe47-dPDBjZBaiNixdkut5dDgVw3Kyvkp0vYAK8Fl3FP2k6nKGMnonbXLbp9DQV8nzAS6LXWQ1jgeWi9hI0Gd5Fc7a7LxugzRkXOuglnHqkTMJvpxFWh-BL-mythIsE2TxZqG04dWYCZyT6z8gjXXFbS-o2-bW6-WpXBhHzsly6b7ITxHQ')`,
              backgroundPosition: 'center 30%'
            }}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-label-sm text-label-sm border border-primary/30 uppercase tracking-widest">
                Rekomendasi Utama
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 text-yellow-400 font-bold text-xs flex items-center gap-1">
                ★ 9.22
              </span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-5xl text-white mb-4 drop-shadow-lg leading-tight font-extrabold">
              Kimi no Na wa.
            </h1>
            <p className="font-body-md text-sm md:text-base text-on-surface-variant mb-8 line-clamp-3 leading-relaxed">
              Mitsuha Miyamizu, seorang gadis SMA di desa terpencil Itomori, bertukar tubuh secara misterius dengan Taki Tachibana, seorang pemuda SMA yang tinggal di Tokyo. Bersama-sama, mereka harus mengungkap misteri bencana meteor besar yang mengancam desa Mitsuha.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="/anime/kimi-na-wa-sub-indo"
                className="primary-gradient px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all neon-glow text-decoration-none text-xs"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Tonton Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Movies Grid List */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
          <h2 className="font-headline-lg text-headline-lg text-white">Daftar Anime Movies</h2>
        </div>

        {moviesList.length === 0 ? (
          <div className="text-center py-20 bg-surface-container/20 rounded-2xl border border-white/5">
            <p className="text-on-surface-variant font-medium">Gagal memuat daftar movie anime. Coba lagi nanti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
            {moviesList.map((item) => (
              <a 
                key={item.animeId} 
                href={`/anime/${item.animeId}`} 
                className="group cursor-pointer text-decoration-none text-on-surface block"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 anime-card-hover transition-all duration-300 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.poster || '/placeholder.jpg'} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase flex items-center gap-1 z-20">
                    ★ {item.score !== 'N/A' ? item.score : 'N/A'}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold uppercase z-20">
                    {item.status}
                  </div>
                  <div className="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
                <h3 className="font-headline-md text-sm text-white line-clamp-1 group-hover:text-primary transition-colors font-semibold">
                  {item.title.replace('Subtitle Indonesia', '').replace('Sub Indo', '').trim()}
                </h3>
                <p className="text-on-surface-variant text-[11px] mt-1">
                  Format: Movie (BD)
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
