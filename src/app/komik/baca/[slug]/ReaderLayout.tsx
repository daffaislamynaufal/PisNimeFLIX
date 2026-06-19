'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChapterItem {
  chapter: string;
  slug: string;
  link: string;
  date: string;
}

interface ComicChapterDetail {
  creator: string;
  manga_title: string;
  chapter_title: string;
  navigation: {
    previousChapter: string | null;
    nextChapter: string | null;
    chapterList: string;
  };
  images: string[];
}

interface ComicDetail {
  slug: string;
  title: string;
  chapters: ChapterItem[];
}

interface ReaderLayoutProps {
  chapterDetail: ComicChapterDetail;
  comicDetail: ComicDetail;
  currentSlug: string;
}

export default function ReaderLayout({ chapterDetail, comicDetail, currentSlug }: ReaderLayoutProps) {
  const router = useRouter();
  const [readerWidth, setReaderWidth] = useState<'narrow' | 'medium' | 'full'>('medium');
  const [brightness, setBrightness] = useState<number>(100); // 0 to 100
  const [showSettings, setShowSettings] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && chapterDetail.navigation.previousChapter) {
        router.push(`/komik/baca/${chapterDetail.navigation.previousChapter}`);
      } else if (e.key === 'ArrowRight' && chapterDetail.navigation.nextChapter) {
        router.push(`/komik/baca/${chapterDetail.navigation.nextChapter}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterDetail.navigation.previousChapter, chapterDetail.navigation.nextChapter, router]);

  const getWidthClass = () => {
    if (readerWidth === 'narrow') return 'max-w-xl md:max-w-2xl';
    if (readerWidth === 'medium') return 'max-w-3xl md:max-w-4xl';
    return 'max-w-full';
  };

  return (
    <div className="relative min-h-screen pb-32">
      {/* Screen Dimmer Shading Overlay */}
      {brightness < 100 && (
        <div 
          className="fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-300"
          style={{ opacity: (100 - brightness) / 100 }}
        />
      )}

      {/* Reader Sticky Header Bar */}
      <header className="sticky top-16 w-full z-40 bg-background/80 backdrop-blur-lg border-b border-white/5 shadow-md py-3 px-6 md:px-margin-desktop">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Info & Back Link */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href={`/komik/${comicDetail.slug}`} 
              className="flex items-center justify-center p-2 rounded-xl bg-surface-container/60 border border-white/5 hover:border-primary/40 text-on-surface-variant hover:text-white transition-all text-decoration-none"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">
                {comicDetail.title}
              </h1>
              <span className="text-[10px] text-on-surface-variant/60 font-semibold">
                {chapterDetail.chapter_title}
              </span>
            </div>
          </div>

          {/* Center: Dropdown Chapter Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            {chapterDetail.navigation.previousChapter ? (
              <Link 
                href={`/komik/baca/${chapterDetail.navigation.previousChapter}`}
                className="flex items-center justify-center p-2 rounded-xl bg-surface-container/65 border border-white/5 text-on-surface-variant hover:text-primary transition-all text-decoration-none"
                title="Chapter Sebelumnya"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </Link>
            ) : (
              <span className="flex items-center justify-center p-2 rounded-xl bg-surface-container-low/20 border border-white/5 text-on-surface-variant/30 cursor-not-allowed">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </span>
            )}

            <select
              value={currentSlug}
              onChange={(e) => router.push(`/komik/baca/${e.target.value}`)}
              className="bg-surface-container-high/60 border border-outline-variant/35 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-primary cursor-pointer w-full max-w-[200px]"
            >
              {comicDetail.chapters.map((ch) => (
                <option key={ch.slug} value={ch.slug}>
                  {ch.chapter}
                </option>
              ))}
            </select>

            {chapterDetail.navigation.nextChapter ? (
              <Link 
                href={`/komik/baca/${chapterDetail.navigation.nextChapter}`}
                className="flex items-center justify-center p-2 rounded-xl bg-surface-container/65 border border-white/5 text-on-surface-variant hover:text-primary transition-all text-decoration-none"
                title="Chapter Selanjutnya"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </Link>
            ) : (
              <span className="flex items-center justify-center p-2 rounded-xl bg-surface-container-low/20 border border-white/5 text-on-surface-variant/30 cursor-not-allowed">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </span>
            )}
          </div>

          {/* Right: Reader Customization Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                showSettings 
                  ? 'primary-gradient text-white border-none' 
                  : 'bg-surface-container/60 border-white/5 text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              Pengaturan
            </button>
          </div>
        </div>

        {/* Expandable Reader Settings Panel */}
        {showSettings && (
          <div className="max-w-container-max mx-auto mt-4 p-4 bg-surface-container/70 border border-white/5 rounded-2xl flex flex-wrap gap-6 items-center justify-between animate-fade-in backdrop-blur-md">
            {/* Width Adjustment */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-on-surface-variant/60 font-semibold">Lebar Halaman:</span>
              <div className="flex gap-1.5">
                {(['narrow', 'medium', 'full'] as const).map((width) => (
                  <button
                    key={width}
                    onClick={() => setReaderWidth(width)}
                    className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase cursor-pointer transition-colors ${
                      readerWidth === width
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {width === 'narrow' ? 'Sempit' : width === 'medium' ? 'Sedang' : 'Lebar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness Dimmer Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-on-surface-variant/60 font-semibold">Kecerahan:</span>
              <div className="flex gap-1">
                {[100, 80, 60, 40, 20].map((level) => (
                  <button
                    key={level}
                    onClick={() => setBrightness(level)}
                    className={`w-8 h-8 rounded-lg border font-bold text-[10px] cursor-pointer transition-colors ${
                      brightness === level
                        ? 'bg-primary/20 text-primary border-primary/40'
                        : 'bg-surface-container-high/40 border-outline-variant/30 text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Keyboard Info Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-on-surface-variant/40 italic">
              <span className="material-symbols-outlined text-xs">keyboard</span>
              Gunakan tombol panah &larr; &amp; &rarr; di keyboard untuk ganti chapter
            </div>
          </div>
        )}
      </header>

      {/* Reader Page Content */}
      <main className={`mx-auto mt-8 px-4 ${getWidthClass()} transition-all duration-300`}>
        {/* Images Stack */}
        <div className="flex flex-col items-center bg-black/40 rounded-3xl overflow-hidden py-4 border border-white/5 shadow-2xl">
          {chapterDetail.images && chapterDetail.images.length > 0 ? (
            chapterDetail.images.map((imgUrl, index) => (
              <div 
                key={index} 
                className="w-full relative flex justify-center bg-zinc-950/45 min-h-[65vh] items-center border-b border-white/5"
              >
                {/* Loader Placeholder (covered when image loads) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2 text-on-surface-variant/20">
                  <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                  <span className="text-[9px] font-mono tracking-widest uppercase">Memuat Hal {index + 1}...</span>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/komik/image?url=${encodeURIComponent(imgUrl)}`}
                  alt={`Halaman ${index + 1}`}
                  loading="lazy"
                  className="max-w-full h-auto object-contain select-none relative z-10"
                  onError={(e) => {
                    console.error('Image load failed for URL:', imgUrl);
                  }}
                />
                
                {/* Page Number indicator overlay */}
                <span className="absolute bottom-2 right-4 px-2 py-0.5 bg-black/75 rounded text-[8px] font-mono text-zinc-500 pointer-events-none border border-zinc-800 z-20">
                  Hal {index + 1} / {chapterDetail.images.length}
                </span>
              </div>
            ))
          ) : (
            <div className="py-24 text-center text-on-surface-variant italic text-sm">
              Gambar chapter tidak tersedia atau gagal dimuat.
            </div>
          )}
        </div>
      </main>

      {/* Bottom Large Nav Controls */}
      <footer className="mt-16 max-w-container-max mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {chapterDetail.navigation.previousChapter ? (
            <Link
              href={`/komik/baca/${chapterDetail.navigation.previousChapter}`}
              className="text-decoration-none w-full sm:w-auto bg-surface-container/60 hover:bg-surface-container border border-outline-variant hover:border-primary/30 px-8 py-3.5 rounded-xl font-bold text-xs text-white text-center flex items-center justify-center gap-2 hover:-translate-x-1 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Chapter Sebelumnya
            </Link>
          ) : (
            <span className="w-full sm:w-auto bg-surface-container-low/10 border border-white/5 px-8 py-3.5 rounded-xl font-bold text-xs text-on-surface-variant/30 text-center flex items-center justify-center gap-2 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Chapter Sebelumnya
            </span>
          )}

          <Link
            href={`/komik/${comicDetail.slug}`}
            className="text-decoration-none w-full sm:w-auto bg-primary/10 hover:bg-primary/20 border border-primary/35 px-8 py-3.5 rounded-xl font-bold text-xs text-primary hover:text-white text-center flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            Kembali ke Detail Komik
          </Link>

          {chapterDetail.navigation.nextChapter ? (
            <Link
              href={`/komik/baca/${chapterDetail.navigation.nextChapter}`}
              className="text-decoration-none w-full sm:w-auto primary-gradient hover:opacity-90 px-8 py-3.5 rounded-xl font-bold text-xs text-white text-center flex items-center justify-center gap-2 hover:translate-x-1 transition-all neon-glow border-none"
            >
              Chapter Selanjutnya
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <span className="w-full sm:w-auto bg-surface-container-low/10 border border-white/5 px-8 py-3.5 rounded-xl font-bold text-xs text-on-surface-variant/30 text-center flex items-center justify-center gap-2 cursor-not-allowed">
              Chapter Selanjutnya
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
