import { getEpisodeDetail, getMirrorIframe } from '@/lib/scraper';
import { notFound } from 'next/navigation';
import WatchPlayer from './WatchPlayer';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnimeWatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const watchData = await getEpisodeDetail(id);

  if (!watchData) {
    notFound();
  }

  // Find the best initial streaming URL
  let initialStreamingUrl = watchData.defaultStreamingUrl;
  let initialQuality = '360p';
  let initialProvider = 'default';

  const mirrors = watchData.mirrors || [];

  // Try to find 720p mega
  let targetMirror = mirrors.find(
    m => m.quality === '720p' && m.provider.trim().toLowerCase() === 'mega'
  );

  // If not found, try any 720p mirror
  if (!targetMirror) {
    targetMirror = mirrors.find(m => m.quality === '720p');
  }

  // If not found, try 480p mega
  if (!targetMirror) {
    targetMirror = mirrors.find(
      m => m.quality === '480p' && m.provider.trim().toLowerCase() === 'mega'
    );
  }

  // If not found, try any 480p mirror
  if (!targetMirror) {
    targetMirror = mirrors.find(m => m.quality === '480p');
  }

  // Resolve the target mirror's iframe URL on the server-side
  if (targetMirror) {
    const resolvedUrl = await getMirrorIframe(targetMirror.content, id);
    if (resolvedUrl) {
      initialStreamingUrl = resolvedUrl;
      initialQuality = targetMirror.quality;
      initialProvider = targetMirror.provider;
    }
  }

  return (
    <div className="app-container" style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Beranda</a>
        <span>/</span>
        <a href={`/anime/${watchData.animeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>Detail Anime</a>
        <span>/</span>
        <span style={{ color: 'var(--text-purple)' }}>Nonton</span>
      </div>

      <div className="watch-layout">
        {/* Left Side: Video Player & Navigation */}
        <section>
          {/* Responsive Embedded Video Player Client Component */}
          <WatchPlayer
            defaultStreamingUrl={watchData.defaultStreamingUrl}
            initialStreamingUrl={initialStreamingUrl}
            initialQuality={initialQuality}
            initialProvider={initialProvider}
            mirrors={mirrors}
            episodeId={id}
            title={watchData.title}
          />

          {/* Episode Info & Navigation */}
          <div className="watch-info" style={{ marginTop: '1.5rem' }}>
            <h1 className="watch-title">{watchData.title}</h1>
            
            {/* Previous / Detail / Next Navigation Controls */}
            <div className="nav-controls">
              <a 
                href={watchData.prevEpisodeId ? `/watch/${watchData.prevEpisodeId}` : '#'} 
                className={`nav-link-btn prev ${!watchData.prevEpisodeId ? 'disabled' : ''}`}
                aria-disabled={!watchData.prevEpisodeId}
              >
                &larr; Episode Sebelumnya
              </a>
              
              <a 
                href={`/anime/${watchData.animeId}`} 
                className="nav-link-btn prev"
                style={{ flex: '0.5' }}
              >
                Detail Anime
              </a>

              <a 
                href={watchData.nextEpisodeId ? `/watch/${watchData.nextEpisodeId}` : '#'} 
                className={`nav-link-btn next ${!watchData.nextEpisodeId ? 'disabled' : ''}`}
                aria-disabled={!watchData.nextEpisodeId}
              >
                Episode Selanjutnya &rarr;
              </a>
            </div>
          </div>
        </section>

        {/* Right Side: Episode Playlist Panel */}
        <aside className="watch-sidebar">
          <div className="playlist-card">
            <h2 className="playlist-header">Daftar Episode</h2>
            
            {watchData.episodeList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                Episode lainnya tidak ditemukan.
              </p>
            ) : (
              <div className="playlist-list">
                {watchData.episodeList.map((ep) => {
                  const isActive = ep.episodeId === id;
                  return (
                    <a
                      key={ep.episodeId}
                      href={`/watch/${ep.episodeId}`}
                      className={`playlist-item ${isActive ? 'active' : ''}`}
                    >
                      {ep.title}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
