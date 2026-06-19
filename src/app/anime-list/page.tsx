import { fetchOngoingAnime, fetchCompleteAnime } from '@/lib/scraper';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AnimeListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status === 'completed' ? 'completed' : 'ongoing';
  const pageStr = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const page = parseInt(pageStr, 10) || 1;

  // Fetch either completed or ongoing anime depending on status filter
  const animeList = status === 'completed' 
    ? await fetchCompleteAnime(page) 
    : await fetchOngoingAnime(page);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] rounded-xl overflow-hidden group shadow-2xl flex items-center p-8 md:p-16 border border-white/5 bg-gradient-to-r from-background via-background/90 to-transparent">
        {/* Background radial/linear gradient base for premium neon glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-0"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(183,109,255,0.15),transparent_60%)] z-0 pointer-events-none"></div>

        {/* Left Content Column */}
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary font-label-sm text-label-sm mb-4 border border-primary/30 uppercase tracking-widest">
            Trending Hari Ini
          </span>
          <h1 className="font-display-lg text-4xl md:text-5xl text-white mb-4 drop-shadow-lg leading-tight font-extrabold">
            Solo Leveling
          </h1>
          <p className="font-body-md text-sm md:text-base text-on-surface-variant mb-8 line-clamp-2 leading-relaxed">
            Di dunia di mana para hunter berbakat harus bertarung melawan monster mematikan untuk melindungi umat manusia, Sung Jin-woo, hunter tingkat rendah, mendapatkan kekuatan misterius yang memungkinkannya untuk terus &quot;Level Up&quot; tanpa batas.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/anime/solo-leveling-sub-indo"
              className="primary-gradient px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all neon-glow text-decoration-none text-xs"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Tonton Sekarang
            </a>
            <a 
              href="/anime/solo-leveling-sub-indo"
              className="bg-surface-container/60 backdrop-blur-md px-8 py-3 rounded-lg font-bold text-white border border-outline-variant hover:bg-surface-container transition-all flex items-center gap-2 text-decoration-none text-xs"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Detail Info
            </a>
          </div>
        </div>

        {/* Right Image Column */}
        <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2 overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent z-10"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            className="w-full h-full object-cover object-top opacity-85 transition-transform duration-700 group-hover:scale-105" 
            alt="Solo Leveling Character"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNwhsVkHLDBICvz0SAk32U9RzlO-qTlNSagSBVb6Q_epMK7OQs2XIdoUgmFG6QpV-YTEAVS7PJmVZKOW1aXsjntK2bd8c74Q7pK7Xq9Skk2JHiJmY6m39POf8Yb4yYki1kWcCXk6ytSmbTWcyoc1vhBhfXVqGb3n60Y8rDoKqFJnK5yTKkSST-jF7rn_tK9Nzp-8KEFDltTFaBQxaqR69yziGwX74e-27pjLplLDfajLEJDbhHjvq4jw"
          />
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="w-full">
        <form action="/anime-list" method="GET" className="glass-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest">Genre</label>
              <select name="genre" className="bg-surface-container-low border border-outline-variant text-on-surface rounded-lg py-2.5 px-3 focus:ring-primary focus:border-primary outline-none">
                <option value="all">Semua Genre</option>
                <option value="action">Action</option>
                <option value="adventure">Adventure</option>
                <option value="fantasy">Fantasy</option>
                <option value="romance">Romance</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest">Status</label>
              <select name="status" defaultValue={status} className="bg-surface-container-low border border-outline-variant text-on-surface rounded-lg py-2.5 px-3 focus:ring-primary focus:border-primary outline-none">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest">Tipe</label>
              <select name="type" className="bg-surface-container-low border border-outline-variant text-on-surface rounded-lg py-2.5 px-3 focus:ring-primary focus:border-primary outline-none">
                <option value="tv">TV Series</option>
                <option value="movie">Movie</option>
                <option value="ova">OVA</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest">Urutkan</label>
              <select name="sort" className="bg-surface-container-low border border-outline-variant text-on-surface rounded-lg py-2.5 px-3 focus:ring-primary focus:border-primary outline-none">
                <option value="newest">Terbaru</option>
                <option value="popular">Populer</option>
                <option value="rating">Rating Terbaik</option>
              </select>
            </div>
          </div>
          <div className="w-full md:w-auto self-end">
            <button type="submit" className="w-full md:w-auto bg-surface-container-high hover:bg-surface-variant border border-outline-variant text-on-surface px-6 py-[10.5px] rounded-lg font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Terapkan Filter
            </button>
          </div>
        </form>
      </section>

      {/* Main Grid */}
      <section className="w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-8 bg-primary rounded-full"></div>
          <h2 className="font-headline-lg text-headline-lg text-white">
            {status === 'completed' ? 'Daftar Anime Completed' : 'Anime Ongoing Terupdate'}
          </h2>
        </div>

        {animeList.length === 0 ? (
          <div className="text-center py-20 bg-surface-container/20 rounded-2xl border border-white/5">
            <p className="text-on-surface-variant">Belum ada anime yang ditemukan.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
              {animeList.map((item) => (
                <a 
                  key={item.animeId} 
                  href={`/anime/${item.animeId}`} 
                  className="anime-card-hover group cursor-pointer transition-all duration-300 text-decoration-none text-on-surface block"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      src={item.poster || '/placeholder.jpg'} 
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-black/60 backdrop-blur-md text-white font-label-sm text-[10px] px-2 py-1 rounded">
                        {item.episodes}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 z-20">
                      <span className="bg-primary text-on-primary font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                        {item.releaseDay}
                      </span>
                    </div>
                    <div className="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-body-md text-white line-clamp-1 group-hover:text-primary transition-colors font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-on-surface-variant text-label-sm mt-1">
                    Rilis: {item.latestReleaseDate}
                  </p>
                </a>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center gap-4">
              <a 
                href={`/anime-list?status=${status}&page=${page - 1}`} 
                className={`w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface-variant text-decoration-none ${
                  page <= 1 ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </a>
              <div className="flex gap-2">
                {page > 1 && (
                  <a href={`/anime-list?status=${status}&page=${page - 1}`} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-decoration-none text-on-surface">
                    {page - 1}
                  </a>
                )}
                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">
                  {page}
                </span>
                <a href={`/anime-list?status=${status}&page=${page + 1}`} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors text-decoration-none text-on-surface">
                  {page + 1}
                </a>
              </div>
              <a 
                href={`/anime-list?status=${status}&page=${page + 1}`} 
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface-variant text-decoration-none"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
