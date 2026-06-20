'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface AnimeItem {
  animeId: string;
  title: string;
  poster: string;
  episodes?: string;
  releaseDay?: string;
  latestReleaseDate?: string;
  isSearch: boolean;
}

export default function AnimeCatalogPage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnime = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/anime?page=${currentPage}`;
      if (searchTrigger) {
        url += `&q=${encodeURIComponent(searchTrigger)}`;
      } else {
        url += `&status=${activeTab}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Gagal memuat anime');
      }
      const data = await res.json();
      
      setAnimeList(data.items || []);
      setHasMore(data.hasMore ?? false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat data anime.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTrigger]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  const handleTabChange = (tab: 'ongoing' | 'completed') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchTrigger('');
    setSelectedType('all');
    setSelectedGenre('all');
    setSelectedSort('newest');
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(searchQuery);
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDisplayedAnime = () => {
    let list = [...animeList];

    // Status filter for search results (since status is mapped to episodes field in api)
    if (searchTrigger) {
      list = list.filter((item) => {
        const statusLower = (item.episodes || '').toLowerCase();
        return statusLower.includes(activeTab.toLowerCase());
      });
    }

    // Client-side genre heuristic (filtering by title keywords)
    if (selectedGenre !== 'all') {
      list = list.filter((item) => {
        const titleLower = item.title.toLowerCase();
        if (selectedGenre === 'action') {
          return titleLower.includes('fight') || titleLower.includes('war') || titleLower.includes('battle') || titleLower.includes('hunter') || titleLower.includes('slayer') || titleLower.includes('tensei') || titleLower.includes('action') || titleLower.includes('clover') || titleLower.includes('kaisen') || titleLower.includes('piece') || titleLower.includes('hero');
        } else if (selectedGenre === 'adventure') {
          return titleLower.includes('adventure') || titleLower.includes('quest') || titleLower.includes('world') || titleLower.includes('journey') || titleLower.includes('gate') || titleLower.includes('online') || titleLower.includes('travel') || titleLower.includes('piece');
        } else if (selectedGenre === 'fantasy') {
          return titleLower.includes('fantasy') || titleLower.includes('isekai') || titleLower.includes('magic') || titleLower.includes('demon') || titleLower.includes('maou') || titleLower.includes('tensei') || titleLower.includes('god') || titleLower.includes('leveling') || titleLower.includes('level');
        } else if (selectedGenre === 'romance') {
          return titleLower.includes('love') || titleLower.includes('romance') || titleLower.includes('girlfriend') || titleLower.includes('boyfriend') || titleLower.includes('kanojo') || titleLower.includes('marriage') || titleLower.includes('kimochi') || titleLower.includes('ko') || titleLower.includes('date');
        }
        return true;
      });
    }

    // Client-side type filter based on title heuristic
    if (selectedType !== 'all') {
      list = list.filter((item) => {
        const titleLower = item.title.toLowerCase();
        if (selectedType === 'movie') {
          return titleLower.includes('movie') || titleLower.includes('film') || titleLower.includes('the movie');
        } else if (selectedType === 'ova') {
          return titleLower.includes('ova');
        } else if (selectedType === 'special') {
          return titleLower.includes('special') || titleLower.includes('spesial');
        } else if (selectedType === 'tv') {
          return !titleLower.includes('movie') && !titleLower.includes('film') && !titleLower.includes('the movie') && !titleLower.includes('ova') && !titleLower.includes('special') && !titleLower.includes('spesial');
        }
        return true;
      });
    }

    // Client-side sort
    if (selectedSort === 'rating') {
      list.sort((a, b) => {
        const getScore = (item: AnimeItem) => {
          if (item.releaseDay && item.releaseDay.includes('★')) {
            const num = parseFloat(item.releaseDay.replace('★', '').trim());
            return isNaN(num) ? 0 : num;
          }
          return 0;
        };
        return getScore(b) - getScore(a);
      });
    } else if (selectedSort === 'popular') {
      // Popular simulation using episodes count values
      list.sort((a, b) => {
        const aEp = parseInt(a.episodes || '0', 10) || 0;
        const bEp = parseInt(b.episodes || '0', 10) || 0;
        return bEp - aEp;
      });
    }

    return list;
  };

  const displayedAnime = getDisplayedAnime();
  const isFiltered = selectedGenre !== 'all' || selectedType !== 'all' || selectedSort !== 'newest';

  return (
    <div className="min-h-screen px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">smart_display</span>
              Koleksi <span className="text-transparent bg-clip-text primary-gradient">Anime</span>
            </h1>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-xl">
              Temukan ribuan judul Anime Ongoing dan Completed terbaik dengan terjemahan Indonesia.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Cari anime (contoh: Solo Leveling, Naruto)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl pl-12 pr-24 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-on-surface-variant/40 transition-colors backdrop-blur-md"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 primary-gradient px-4 py-1.5 rounded-lg text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Filter Section */}
        <div className="w-full bg-surface-container-high/20 border border-outline-variant/20 rounded-2xl p-6 mb-8 backdrop-blur-md flex flex-col gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Genre</label>
              <div className="relative">
                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary backdrop-blur-md text-sm outline-none cursor-pointer appearance-none transition-all duration-300 hover:border-primary/50"
                >
                  <option value="all" className="bg-surface-container-highest text-white">Semua Genre</option>
                  <option value="action" className="bg-surface-container-highest text-white">Action</option>
                  <option value="adventure" className="bg-surface-container-highest text-white">Adventure</option>
                  <option value="fantasy" className="bg-surface-container-highest text-white">Fantasy</option>
                  <option value="romance" className="bg-surface-container-highest text-white">Romance</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
                  unfold_more
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Status</label>
              <div className="relative">
                <select 
                  value={activeTab} 
                  onChange={(e) => handleTabChange(e.target.value as 'ongoing' | 'completed')}
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary backdrop-blur-md text-sm outline-none cursor-pointer appearance-none transition-all duration-300 hover:border-primary/50"
                >
                  <option value="ongoing" className="bg-surface-container-highest text-white">Ongoing</option>
                  <option value="completed" className="bg-surface-container-highest text-white">Completed</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Tipe</label>
              <div className="relative">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary backdrop-blur-md text-sm outline-none cursor-pointer appearance-none transition-all duration-300 hover:border-primary/50"
                >
                  <option value="all" className="bg-surface-container-highest text-white">Semua Tipe</option>
                  <option value="tv" className="bg-surface-container-highest text-white">TV Series</option>
                  <option value="movie" className="bg-surface-container-highest text-white">Movie</option>
                  <option value="ova" className="bg-surface-container-highest text-white">OVA</option>
                  <option value="special" className="bg-surface-container-highest text-white">Special</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Urutkan</label>
              <div className="relative">
                <select 
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary backdrop-blur-md text-sm outline-none cursor-pointer appearance-none transition-all duration-300 hover:border-primary/50"
                >
                  <option value="newest" className="bg-surface-container-highest text-white">Terbaru</option>
                  <option value="popular" className="bg-surface-container-highest text-white">Populer</option>
                  <option value="rating" className="bg-surface-container-highest text-white">Rating Terbaik</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {isFiltered && (
            <div className="flex justify-end border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  setSelectedGenre('all');
                  setSelectedType('all');
                  setSelectedSort('newest');
                }}
                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                Hapus Filter
              </button>
            </div>
          )}
        </div>
        {searchTrigger && (
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-8">
            <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-primary font-semibold font-body-md">
              Hasil pencarian untuk: &quot;{searchTrigger}&quot;
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchTrigger('');
                  fetchAnime();
                }}
                className="bg-transparent border-none text-primary hover:text-white cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[2/3] bg-white/5"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2 h-4">
                      <div className="h-3 w-16 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-10 flex items-start">
                      <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <div className="h-8 w-full bg-white/5 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
            <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
            <p className="font-semibold text-sm mb-4">{error}</p>
            <button
              onClick={fetchAnime}
              className="primary-gradient px-5 py-2 rounded-xl text-white font-bold text-xs border-none cursor-pointer hover:opacity-90 active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty Catalog State */}
        {!loading && !error && displayedAnime.length === 0 && (
          <div className="text-center py-20 bg-surface-container/20 border border-white/5 rounded-3xl backdrop-blur-sm max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
              search_off
            </span>
            <h3 className="text-white font-bold text-lg mb-2">Anime Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm px-6 leading-relaxed">
              Maaf, kami tidak dapat menemukan anime yang cocok. Coba ganti kata kunci pencarian Anda atau periksa filter Anda.
            </p>
          </div>
        )}

        {/* Grid Catalog */}
        {!loading && !error && displayedAnime.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {displayedAnime.map((anime) => (
                <div
                  key={anime.animeId}
                  className="group bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 hover:bg-surface-container/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div>
                    {/* Anime Poster Link */}
                    <Link href={`/anime/${anime.animeId}`} className="relative aspect-[2/3] block overflow-hidden bg-surface-container-high/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={anime.poster || '/placeholder.jpg'}
                        alt={anime.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                      
                      {/* Floating Badge Left (Episodes) */}
                      {anime.episodes && (
                        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm border border-white/10">
                          {anime.episodes}
                        </span>
                      )}
                      
                      {/* Floating Badge Right (Release Day or Score) */}
                      {anime.releaseDay && (
                        <span className="absolute top-3 right-3 bg-primary/90 text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm">
                          {anime.releaseDay}
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      {/* Release date or source info */}
                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant/60 font-semibold mb-2 h-4">
                        <span>{anime.latestReleaseDate || 'Anime'}</span>
                      </div>

                      {/* Anime Title Link */}
                      <Link href={`/anime/${anime.animeId}`} className="text-decoration-none block h-10">
                        <h3 className="font-bold text-sm text-white hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {anime.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Watch Now Link */}
                  <div className="px-4 pb-4 pt-1 border-t border-white/5">
                    <Link
                      href={`/anime/${anime.animeId}`}
                      className="text-decoration-none block text-center bg-surface-container-high/40 hover:bg-primary/20 border border-outline-variant/30 hover:border-primary/40 py-2 rounded-xl text-[10px] font-bold text-on-surface-variant hover:text-white transition-all"
                    >
                      Tonton Sekarang
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {!searchTrigger && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="bg-surface-container/60 hover:bg-surface-container border border-white/10 disabled:opacity-40 disabled:pointer-events-none px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Surrounding Pages logic */}
                  {Array.from({ length: Math.min(5, hasMore ? currentPage + 2 : currentPage) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer border-none ${
                          currentPage === pageNum
                            ? 'primary-gradient text-white shadow-md shadow-primary/10'
                            : 'bg-surface-container/40 text-on-surface-variant hover:text-white hover:bg-surface-container'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!hasMore || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="bg-surface-container/60 hover:bg-surface-container border border-white/10 disabled:opacity-40 disabled:pointer-events-none px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  Selanjutnya
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
