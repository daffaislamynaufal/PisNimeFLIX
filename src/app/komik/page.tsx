'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface ComicItem {
  title: string;
  thumbnail: string;
  type: string;
  genre: string;
  slug: string;
  description: string;
  stats?: string;
  latestChapter?: {
    title: string;
    url: string;
  } | null;
}

export default function KomikCatalogPage() {
  const getCleanImageUrl = (url: string) => {
    if (!url) return '';
    // Removes WordPress image resizing suffixes (e.g., -150x150, -300x400) to fetch the full uncropped image
    return url.replace(/-(\d+)x(\d+)\.(jpg|jpeg|png|webp)/i, '.$3');
  };

  const getProxiedImageUrl = (url: string) => {
    if (!url) return '/asset/img/placeholder.jpg';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    const cleanUrl = getCleanImageUrl(url);
    return `/api/komik/image?url=${encodeURIComponent(cleanUrl)}`;
  };

  const [activeTab, setActiveTab] = useState<'all' | 'manga' | 'manhwa' | 'manhua'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [comics, setComics] = useState<ComicItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/komik?page=${currentPage}`;
      if (searchTrigger) {
        url += `&q=${encodeURIComponent(searchTrigger)}`;
      } else if (activeTab !== 'all') {
        url += `&type=${activeTab}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Gagal memuat komik');
      }
      const data = await res.json();
      
      setComics(data.items || []);
      setHasMore(data.hasMore ?? false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat data komik.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTrigger]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  const handleTabChange = (tab: 'all' | 'manga' | 'manhwa' | 'manhua') => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchTrigger('');
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

  const getTypeBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'manga') {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    } else if (t === 'manhwa') {
      return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    } else if (t === 'manhua') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-primary/10 text-primary border-primary/30';
  };

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
              <span className="material-symbols-outlined text-primary text-4xl">menu_book</span>
              Koleksi <span className="text-transparent bg-clip-text primary-gradient">Komik</span>
            </h1>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-xl">
              Temukan ribuan judul Manga Jepang, Manhwa Korea, dan Manhua China terbaik dengan terjemahan Indonesia.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Cari komik (contoh: Naruto, Solo Leveling)..."
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

        {/* Catalog Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {(['all', 'manga', 'manhwa', 'manhua'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs capitalize transition-all border-none cursor-pointer ${
                  activeTab === tab && !searchTrigger
                    ? 'primary-gradient text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-surface-container/40 text-on-surface-variant hover:text-white hover:bg-surface-container/80'
                }`}
              >
                {tab === 'all' ? 'Semua Komik' : tab}
              </button>
            ))}
          </div>

          {searchTrigger && (
            <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-primary font-semibold">
              Hasil pencarian untuk: &quot;{searchTrigger}&quot;
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchTrigger('');
                  fetchComics();
                }}
                className="bg-transparent border-none text-primary hover:text-white cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/30 animate-spin"></div>
            <p className="text-on-surface-variant font-bold text-sm">Sedang memuat katalog komik...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
            <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
            <p className="font-semibold text-sm mb-4">{error}</p>
            <button
              onClick={fetchComics}
              className="primary-gradient px-5 py-2 rounded-xl text-white font-bold text-xs border-none cursor-pointer hover:opacity-90 active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty Catalog State */}
        {!loading && !error && comics.length === 0 && (
          <div className="text-center py-20 bg-surface-container/20 border border-white/5 rounded-3xl backdrop-blur-sm max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
              search_off
            </span>
            <h3 className="text-white font-bold text-lg mb-2">Komik Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm px-6 leading-relaxed">
              Maaf, kami tidak dapat menemukan komik yang cocok. Coba ganti kata kunci pencarian Anda atau periksa filter Anda.
            </p>
          </div>
        )}

        {/* Grid Catalog */}
        {!loading && !error && comics.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {comics.map((comic) => (
                <div
                  key={comic.slug}
                  className="group bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 hover:bg-surface-container/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div>
                    {/* Comic Poster Link */}
                    <Link href={`/komik/${comic.slug}`} className="relative aspect-[2/3] block overflow-hidden bg-surface-container-high/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getProxiedImageUrl(comic.thumbnail)}
                        alt={comic.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/asset/img/placeholder.jpg';
                        }}
                      />
                      
                      {/* Floating Type Badge */}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider border backdrop-blur-md shadow-sm ${getTypeBadgeStyle(comic.type)}`}>
                        {comic.type}
                      </span>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      {/* Genre & Stats info */}
                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant/60 font-semibold mb-2">
                        <span>{comic.genre || 'General'}</span>
                        {comic.stats && <span className="opacity-85">{comic.stats.split('|')[0].trim()}</span>}
                      </div>

                      {/* Comic Title Link */}
                      <Link href={`/komik/${comic.slug}`} className="text-decoration-none">
                        <h3 className="font-bold text-sm text-white hover:text-primary transition-colors line-clamp-2 leading-tight mb-2">
                          {comic.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Latest Chapter Link */}
                  {comic.latestChapter ? (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <Link
                        href={`/komik/baca/${comic.latestChapter.url.split('/').pop()}`}
                        className="text-decoration-none block text-center bg-surface-container-high/40 hover:bg-primary/20 border border-outline-variant/30 hover:border-primary/40 py-2 rounded-xl text-[10px] font-bold text-on-surface-variant hover:text-white transition-all"
                      >
                        {comic.latestChapter.title.replace(comic.title, '').trim() || 'Baca Chapter Baru'}
                      </Link>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <span className="block text-center bg-surface-container-high/20 border border-white/5 py-2 rounded-xl text-[10px] font-semibold text-on-surface-variant/40">
                        Belum ada chapter
                      </span>
                    </div>
                  )}
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
                    if (pageNum > 150) return null;
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
