'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OngoingAnime {
  title: string;
  poster: string;
  episodes: string;
  animeId: string;
  latestReleaseDate: string;
  releaseDay: string;
}

interface ScheduleClientProps {
  initialAnimeList: OngoingAnime[];
}

const DAYS_INDONESIAN = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const TABS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function ScheduleClient({ initialAnimeList }: ScheduleClientProps) {
  const [todayName, setTodayName] = useState('Rabu');
  const [activeTab, setActiveTab] = useState('Rabu');

  useEffect(() => {
    // Determine current day of the week on client side to avoid hydration mismatches
    const dayIndex = new Date().getDay();
    const currentDay = DAYS_INDONESIAN[dayIndex];
    setTodayName(currentDay);
    setActiveTab(currentDay);
  }, []);

  // Filter anime based on selected day
  const filteredAnime = initialAnimeList.filter((anime) => {
    if (!anime.releaseDay) return false;
    const day = anime.releaseDay.toLowerCase();
    const active = activeTab.toLowerCase();
    return day.includes(active);
  });

  return (
    <div>
      {/* Day Tabs Section */}
      <section className="mb-8 sticky top-20 z-40 bg-background/80 backdrop-blur-md py-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {TABS.map((tab) => {
            const isToday = tab === todayName;
            const isActive = tab === activeTab;
            const label = isToday ? `${tab} (Hari Ini)` : tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl border font-label-sm transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'primary-gradient text-on-primary font-bold shadow-lg shadow-primary/20 border-transparent'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary bg-surface-container/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Anime Grid */}
      {filteredAnime.length === 0 ? (
        <div className="text-center py-20 bg-surface-container/20 rounded-2xl border border-white/5">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
            calendar_today
          </span>
          <p className="text-on-surface-variant font-medium">
            Tidak ada rilis anime terjadwal pada hari {activeTab}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-gutter">
          {filteredAnime.map((item) => {
            const isCurrentDayRelease = activeTab === todayName;

            return (
              <Link
                key={item.animeId}
                href={`/anime/${item.animeId}`}
                className="flex flex-col gap-stack-sm group anime-card-hover cursor-pointer text-decoration-none text-on-surface block"
              >
                <div 
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden glass-panel ${
                    isCurrentDayRelease ? 'border border-primary/30 shadow-lg shadow-primary/5' : 'border border-white/5'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={item.poster || '/placeholder.jpg'}
                    alt={item.title}
                    loading="lazy"
                  />
                  
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                    {isCurrentDayRelease && (
                      <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Rilis Hari Ini
                      </span>
                    )}
                    <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full w-fit">
                      {item.episodes}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <div className="flex items-center gap-1 text-white/90">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="text-[11px] font-bold">Update: {item.latestReleaseDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-headline-md text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1 font-semibold">
                    {item.title}
                  </h3>
                  <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                    Tayang: {item.releaseDay}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
