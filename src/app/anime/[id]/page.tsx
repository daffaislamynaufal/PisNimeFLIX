import { getAnimeDetail } from '@/lib/scraper';
import { notFound } from 'next/navigation';
import Script from 'next/script';

interface AnimePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AnimePageProps) {
  const { id } = await params;
  const details = await getAnimeDetail(id);
  if (!details) return { title: 'Anime Not Found | PisNime Flix' };
  return {
    title: `${details.title} | PisNime Flix`,
    description: details.synopsis.slice(0, 160),
  };
}

export default async function AnimeDetailPage({ params }: AnimePageProps) {
  const { id } = await params;
  const details = await getAnimeDetail(id);

  if (!details) {
    notFound();
  }

  // Extract release year from details.aired
  let releaseYear = 'N/A';
  if (details.aired) {
    const match = details.aired.match(/\b(19\d\d|20\d\d)\b/);
    if (match) releaseYear = match[1];
  }

  return (
    <>
      {/* Import external fonts & symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Hanken+Grotesk:wght@400;500;700&family=Geist:wght@400;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <main className="font-body-md text-body-md relative mt-0 pt-0 pb-24 bg-background text-on-surface">
        {/* Cinematic Background Banner */}
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 blur-md opacity-30 scale-105" 
            style={{ backgroundImage: `url('${details.poster}')` }}
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-container-max mx-auto px-6 md:px-12 pb-12 w-full grid md:grid-cols-12 gap-8 items-end">
              {/* Poster Overlay (Desktop) */}
              <div className="hidden md:block md:col-span-3">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 neon-glow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover" 
                    alt={details.title}
                    src={details.poster || '/placeholder.jpg'} 
                  />
                </div>
              </div>
              
              {/* Anime Quick Info */}
              <div className="md:col-span-9 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                      {details.status || 'Ongoing'}
                    </span>
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-label-sm text-label-sm">
                      {details.type || 'TV'}
                    </span>
                  </div>
                  <h1 className="font-display-lg text-display-lg md:text-display-lg text-on-surface leading-tight">
                    {details.title}
                  </h1>
                  <div className="flex items-center gap-6 text-on-surface-variant font-body-md">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-on-surface">{details.score || 'N/A'}</span>
                    </div>
                    <span>{releaseYear}</span>
                    <span>{details.episodes || '?' } Episode</span>
                    <span>{details.studios || 'N/A'}</span>
                  </div>
                </div>
                
                <p className="text-on-surface-variant max-w-2xl font-body-lg line-clamp-3 md:line-clamp-none">
                  {details.synopsis.split('\n\n')[0] || 'Tidak ada deskripsi singkat.'}
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  {details.episodeList.length > 0 ? (
                    <a 
                      href={`/watch/${details.episodeList[0].episodeId}`}
                      className="bg-primary-container hover:bg-primary-container/90 text-on-primary-container px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg neon-glow text-decoration-none"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      Mulai Tonton
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="bg-primary-container/50 text-on-primary-container/50 px-8 py-4 rounded-xl font-bold flex items-center gap-3 cursor-not-allowed"
                    >
                      Belum Tersedia
                    </button>
                  )}
                  
                  <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold flex items-center gap-3 border border-outline-variant/30 transition-all active:scale-95">
                    <span className="material-symbols-outlined">add</span>
                    Tambah ke Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <section className="max-w-container-max mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Details & Episode List */}
          <div className="md:col-span-8 space-y-12">
            
            {/* Synopsis */}
            <div className="space-y-6">
              <h2 className="font-display-lg text-headline-lg flex items-center gap-4">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                Sinopsis Lengkap
              </h2>
              <div className="bg-surface-container/30 p-8 rounded-2xl border border-white/5 leading-relaxed text-on-surface-variant">
                {details.synopsis.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h2 className="font-display-lg text-headline-lg flex items-center gap-4">
                  <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                  Daftar Episode
                </h2>
                <span className="text-on-surface-variant font-label-sm">
                  {details.episodeList.length} Episode Tersedia
                </span>
              </div>
              
              <div className="grid gap-4">
                {details.episodeList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-surface-container/20 border border-white/5 text-center text-on-surface-variant">
                    Belum ada episode yang tersedia untuk anime ini.
                  </div>
                ) : (
                  details.episodeList.map((ep, idx) => (
                    <a 
                      key={ep.episodeId}
                      href={`/watch/${ep.episodeId}`}
                      className="group flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-surface-container/20 border border-white/5 hover:bg-surface-container/50 transition-all cursor-pointer text-decoration-none"
                    >
                      <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={ep.title} 
                          src={details.poster}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-primary p-2.5 rounded-full shadow-lg">
                            <span className="material-symbols-outlined text-on-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-center gap-1">
                        <h3 className="font-headline-md text-on-surface group-hover:text-primary transition-colors text-base">
                          {ep.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          Nonton streaming dan download {details.title} {ep.title} dengan subtitle Indonesia kualitas HD di PisNime Flix.
                        </p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Info */}
          <aside className="md:col-span-4 space-y-8">
            
            {/* Information Bento */}
            <div className="bg-surface-container-high p-8 rounded-3xl border border-white/10 space-y-8">
              {details.genres && details.genres.length > 0 && (
                <div>
                  <h3 className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-4">Genre</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span key={genre} className="px-3 py-1 bg-surface-container text-primary border border-primary/20 rounded-lg text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Status</h3>
                  <p className="font-bold text-on-surface">{details.status || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Produser</h3>
                  <p className="font-bold text-on-surface truncate" title={details.producers}>{details.producers || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Tipe</h3>
                  <p className="font-bold text-on-surface">{details.type || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-on-surface-variant font-label-sm uppercase tracking-widest mb-1">Studio</h3>
                  <p className="font-bold text-on-surface">{details.studios || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {details.recommendations && details.recommendations.length > 0 && (
              <div className="space-y-6">
                <h2 className="font-display-lg text-headline-md flex items-center gap-4">
                  <span className="w-1 h-6 bg-secondary rounded-full"></span>
                  Rekomendasi Terkait
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {details.recommendations.slice(0, 4).map((item) => (
                    <a key={item.animeId} href={`/anime/${item.animeId}`} className="group cursor-pointer text-decoration-none">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2 relative border border-white/5 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt={item.title} 
                          src={item.poster || '/placeholder.jpg'} 
                        />
                      </div>
                      <h4 className="text-sm font-bold truncate text-on-surface group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}
