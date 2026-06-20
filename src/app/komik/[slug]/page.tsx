import React from 'react';
import { fetchComicDetail } from '@/lib/scraper';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ChapterList from './ChapterList';

const getProxiedImageUrl = (url: string) => {
  if (!url) return '/asset/img/placeholder.jpg';
  if (url.startsWith('/') || url.startsWith('data:')) return url;
  return `/api/komik/image?url=${encodeURIComponent(url)}`;
};

interface ComicDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComicDetailPageProps) {
  const { slug } = await params;
  const comic = await fetchComicDetail(slug);
  if (!comic) return { title: 'Komik Tidak Ditemukan - PisNime Flix' };

  return {
    title: `Baca Komik ${comic.title} Bahasa Indonesia - PisNime Flix`,
    description: comic.synopsis ? comic.synopsis.slice(0, 160) : `Baca komik ${comic.title} gratis di PisNime Flix.`,
  };
}

export default async function ComicDetailPage({ params }: ComicDetailPageProps) {
  const { slug } = await params;
  const data = await fetchComicDetail(slug);

  if (!data) {
    notFound();
  }

  const comic = data;

  const getTypeBadgeColor = (type: string | undefined) => {
    const t = (type || '').toLowerCase();
    if (t === 'manga') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (t === 'manhwa') return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
    if (t === 'manhua') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    return 'text-primary bg-primary/10 border-primary/30';
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    const s = (status || '').toLowerCase();
    if (s.includes('ongoing') || s.includes('berjalan')) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <div className="min-h-screen relative py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${getProxiedImageUrl(comic.image)})` }}
      ></div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/80 mb-8">
          <Link href="/" className="text-decoration-none text-inherit hover:text-white transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href="/komik" className="text-decoration-none text-inherit hover:text-white transition-colors">Katalog Komik</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-primary font-bold">{comic.title}</span>
        </div>

        {/* Comic Header Info block */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          {/* Cover Art Box */}
          <div className="w-full sm:w-64 flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-surface-container-high/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getProxiedImageUrl(comic.image)}
                alt={comic.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
            
            {/* Quick Read Button */}
            {comic.chapters && comic.chapters.length > 0 && (
              <Link
                href={`/komik/baca/${comic.chapters[comic.chapters.length - 1].slug}`}
                className="text-decoration-none mt-4 w-full primary-gradient py-3.5 rounded-xl font-bold text-xs text-white text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Baca Chapter Pertama
              </Link>
            )}
          </div>

          {/* Info Details Box */}
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider border uppercase ${getTypeBadgeColor(comic.metadata?.type)}`}>
                {comic.metadata?.type || 'Manga'}
              </span>
              <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold tracking-wider border uppercase ${getStatusBadgeColor(comic.metadata?.status)}`}>
                {comic.metadata?.status || 'Ongoing'}
              </span>
            </div>

            <h1 className="font-display-lg text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
              {comic.title}
            </h1>
            
            {comic.title_indonesian && (
              <h2 className="font-body-md text-sm md:text-base text-on-surface-variant font-medium mb-6">
                Nama Lain: {comic.title_indonesian}
              </h2>
            )}

            {/* Metadata Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-surface-container/20 border border-white/5 rounded-2xl p-5 mb-6 backdrop-blur-md">
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Pengarang</span>
                <span className="text-xs text-white font-bold">{comic.metadata?.author || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Arah Baca</span>
                <span className="text-xs text-white font-bold">{comic.metadata?.reading_direction || 'Kiri ke Kanan'}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Konsep</span>
                <span className="text-xs text-white font-bold">{comic.metadata?.concept || 'Fantasi'}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant/60 font-semibold block mb-1">Peringkat Umur</span>
                <span className="text-xs text-white font-bold">{comic.metadata?.age_rating || 'Semua Umur'}</span>
              </div>
            </div>

            {/* Genres */}
            {comic.genres && comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {comic.genres.map((g) => (
                  <span
                    key={g.slug}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/30 text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div>
              <h3 className="font-bold text-sm text-white mb-2">Sinopsis</h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed max-w-4xl whitespace-pre-line bg-surface-container/10 p-4 rounded-xl border border-white/5">
                {comic.synopsis || 'Belum ada sinopsis untuk komik ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-12">
          <ChapterList chapters={comic.chapters || []} comicTitle={comic.title} />
        </div>

        {/* Similar Comics / Recommendations Section */}
        {/* Wait, we noticed similar_manga exists. Let's see if it's populated */}
        {comic.similar_manga && comic.similar_manga.length > 0 && (
          <div>
            <h2 className="font-display-md text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">recommend</span>
              Rekomendasi Serupa
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {comic.similar_manga.slice(0, 6).map((item: any) => {
                let simSlug = item.slug || '';
                if (!simSlug && item.link) {
                  const parts = item.link.replace(/\/$/, '').split('/');
                  simSlug = parts[parts.length - 1];
                }
                return (
                  <Link
                    key={simSlug}
                    href={`/komik/${simSlug}`}
                    className="group bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 transition-all text-decoration-none flex flex-col hover:-translate-y-1"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-surface-container-high/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getProxiedImageUrl(item.image)}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/asset/img/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-xs text-white hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                      {item.type && (
                        <span className="text-[9px] text-on-surface-variant/60 mt-1 block">
                          {item.type}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
