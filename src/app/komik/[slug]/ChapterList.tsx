'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ChapterItem {
  chapter: string;
  slug: string;
  link: string;
  date: string;
}

interface ChapterListProps {
  chapters: ChapterItem[];
  comicTitle: string;
}

export default function ChapterList({ chapters, comicTitle }: ChapterListProps) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredChapters = chapters
    .filter((ch) =>
      ch.chapter.toLowerCase().includes(search.toLowerCase()) ||
      ch.date.includes(search)
    )
    .sort((a, b) => {
      const aNum = parseFloat(a.chapter.replace(/[^\d.]/g, '')) || 0;
      const bNum = parseFloat(b.chapter.replace(/[^\d.]/g, '')) || 0;
      return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
    });

  return (
    <div className="bg-surface-container/30 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="font-display-md text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
            Daftar Chapter
          </h2>
          <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">
            Total {chapters.length} chapter tersedia untuk dibaca
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Chapter Search */}
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <input
              type="text"
              placeholder="Cari chapter (e.g. 50)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-base">
              search
            </span>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 hover:border-primary/40 hover:text-white text-on-surface-variant transition-colors cursor-pointer"
            title={sortOrder === 'desc' ? 'Urutkan Terlama' : 'Urutkan Terbaru'}
          >
            <span className="material-symbols-outlined text-lg">
              {sortOrder === 'desc' ? 'sort_by_alpha' : 'text_rotation_none'}
            </span>
          </button>
        </div>
      </div>

      {filteredChapters.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant italic text-sm">
          Chapter tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredChapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/komik/baca/${ch.slug}`}
              className="flex justify-between items-center px-4 py-3 bg-surface-container-high/35 border border-white/5 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-decoration-none group"
            >
              <div className="flex flex-col">
                <span className="font-bold text-xs text-white group-hover:text-primary transition-colors">
                  {ch.chapter}
                </span>
                <span className="text-[10px] text-on-surface-variant/60 mt-0.5">
                  {ch.date || 'Rilis Baru'}
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/45 group-hover:text-primary group-hover:translate-x-1 transition-all text-base">
                arrow_forward_ios
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
