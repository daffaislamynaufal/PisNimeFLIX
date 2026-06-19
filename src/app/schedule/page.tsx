import { fetchOngoingAnime } from '@/lib/scraper';
import { ScheduleClient } from './ScheduleClient';

// Force dynamic page rendering to ensure release schedule is always fresh
export const revalidate = 300; // Cache for 5 minutes

export default async function SchedulePage() {
  // Fetch first 2 pages of ongoing anime in parallel to get a complete schedule of active titles
  const [page1, page2] = await Promise.all([
    fetchOngoingAnime(1),
    fetchOngoingAnime(2)
  ]);

  // Combine and deduplicate list by animeId
  const combinedList = [...page1, ...page2];
  const uniqueAnimeMap = new Map();
  for (const item of combinedList) {
    if (!uniqueAnimeMap.has(item.animeId)) {
      uniqueAnimeMap.set(item.animeId, item);
    }
  }
  const ongoingList = Array.from(uniqueAnimeMap.values());

  return (
    <main className="pt-8 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white">Jadwal Rilis Anime</h1>
        </div>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Pantau jadwal rilis anime ongoing terupdate setiap minggunya. Hari rilis disesuaikan dengan waktu tayang lokal.
        </p>
      </header>

      {/* Interactive Schedule Tabs and Grid */}
      <ScheduleClient initialAnimeList={ongoingList} />
    </main>
  );
}
