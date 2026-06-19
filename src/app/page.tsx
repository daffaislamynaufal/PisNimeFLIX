import { fetchOngoingAnime, searchAnime } from '@/lib/scraper';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
  const pageStr = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1';
  const page = parseInt(pageStr, 10) || 1;

  const isSearch = search.trim().length > 0;
  
  // Fetch data on the server
  let ongoingList = isSearch ? [] : await fetchOngoingAnime(page);
  let searchResults = isSearch ? await searchAnime(search) : [];

  // Static list of popular manga for the slider
  const mangaList = [
    { title: "Blue Lock", ch: "Ch. 240", bg: "from-blue-600/30 to-slate-900" },
    { title: "Chainsaw Man", ch: "Ch. 152", bg: "from-orange-600/30 to-slate-900" },
    { title: "Spy x Family", ch: "Ch. 92", bg: "from-teal-600/30 to-slate-900" },
    { title: "Kaiju No. 8", ch: "Ch. 104", bg: "from-cyan-600/30 to-slate-900" },
    { title: "Boruto: TBV", ch: "Ch. 8", bg: "from-indigo-600/30 to-slate-900" },
    { title: "Black Clover", ch: "Ch. 370", bg: "from-red-600/30 to-slate-900" },
    { title: "My Hero Academia", ch: "Ch. 418", bg: "from-emerald-600/30 to-slate-900" },
    { title: "Sakamoto Days", ch: "Ch. 162", bg: "from-yellow-600/30 to-slate-900" }
  ];

  return (
    <div className="space-y-12">
      {isSearch ? (
        // Search Results Section
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
              <h2 className="font-headline-lg text-headline-lg">
                Hasil Pencarian: &quot;{search}&quot;
              </h2>
            </div>
            <a href="/" className="px-5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-xl font-bold transition-all text-decoration-none text-xs">
              Kembali ke Beranda
            </a>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-20 bg-surface-container/20 rounded-2xl border border-white/5">
              <p className="text-on-surface-variant font-medium text-lg mb-4">
                Maaf, anime yang Anda cari tidak ditemukan.
              </p>
              <a href="/" className="primary-gradient px-6 py-3 rounded-lg font-bold text-white text-decoration-none inline-block hover:opacity-90 active:scale-95 transition-all">
                Kembali ke Beranda
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-gutter">
              {searchResults.map((item) => (
                <a key={item.animeId} href={`/anime/${item.animeId}`} className="group cursor-pointer text-decoration-none text-on-surface">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 anime-card-hover transition-all duration-300 border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.poster || '/placeholder.jpg'} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                      ★ {item.score !== 'N/A' ? item.score : 'N/A'}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold uppercase">
                      {item.status}
                    </div>
                  </div>
                  <h3 className="font-headline-md text-body-md line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                </a>
              ))}
            </div>
          )}
        </section>
      ) : (
        // Standard Homepage content
        <>
          {/* Hero Section */}
          {page === 1 && (
            <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
              <div className="relative w-full h-[450px] md:h-[500px] rounded-xl overflow-hidden group shadow-2xl flex items-center p-8 md:p-16 border border-white/5 bg-gradient-to-r from-background via-background/90 to-transparent">
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
                  <p className="font-body-md text-sm md:text-base text-on-surface-variant mb-8 line-clamp-3 leading-relaxed">
                    Di dunia di mana para hunter berbakat harus bertarung melawan monster mematikan untuk melindungi umat manusia, Sung Jin-woo, hunter tingkat terendah, mendapatkan kekuatan misterius yang memungkinkannya untuk terus &quot;Level Up&quot; tanpa batas.
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
                  {/* Left-to-right fade out gradient specifically blending the image into the dark container */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent z-10"></div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover object-top opacity-85 transition-transform duration-700 group-hover:scale-105" 
                    alt="Solo Leveling Character"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNwhsVkHLDBICvz0SAk32U9RzlO-qTlNSagSBVb6Q_epMK7OQs2XIdoUgmFG6QpV-YTEAVS7PJmVZKOW1aXsjntK2bd8c74Q7pK7Xq9Skk2JHiJmY6m39POf8Yb4yYki1kWcCXk6ytSmbTWcyoc1vhBhfXVqGb3n60Y8rDoKqFJnK5yTKkSST-jF7rn_tK9Nzp-8KEFDltTFaBQxaqR69yziGwX74e-27pjLplLDfajLEJDbhHjvq4jw"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Anime Ongoing Terupdate */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
                <h2 className="font-headline-lg text-headline-lg">Anime Ongoing Terupdate</h2>
              </div>
            </div>

            {ongoingList.length === 0 ? (
              <div className="text-center py-20 bg-surface-container/20 rounded-2xl border border-white/5">
                <p className="text-on-surface-variant">Gagal memuat data anime. Pastikan target scraper aktif.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-gutter">
                  {ongoingList.map((item) => (
                    <a key={item.animeId} href={`/anime/${item.animeId}`} className="group cursor-pointer text-decoration-none text-on-surface">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 anime-card-hover transition-all duration-300 border border-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          className="w-full h-full object-cover" 
                          src={item.poster || '/placeholder.jpg'} 
                          alt={item.title}
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                          {item.episodes}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold uppercase">
                          {item.releaseDay}
                        </div>
                      </div>
                      <h3 className="font-headline-md text-body-md line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-on-surface-variant font-label-sm text-label-sm mt-1">
                        Rilis: {item.latestReleaseDate}
                      </p>
                    </a>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center gap-4 mt-12">
                  <a 
                    href={`/?page=${page - 1}`}
                    className={`px-6 py-3 rounded-xl border border-outline-variant/30 font-bold transition-all text-decoration-none text-xs flex items-center justify-center ${
                      page <= 1 ? 'opacity-35 cursor-not-allowed pointer-events-none' : 'bg-surface-container hover:bg-surface-container-high'
                    }`}
                  >
                    Sebelumnya
                  </a>
                  <span className="flex items-center font-bold text-primary text-xs">
                    Halaman {page}
                  </span>
                  <a 
                    href={`/?page=${page + 1}`}
                    className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 active:scale-95 transition-all text-decoration-none text-xs flex items-center justify-center shadow-lg shadow-primary/25"
                  >
                    Selanjutnya
                  </a>
                </div>
              </>
            )}
          </section>

          {/* Anime Populer (Bento Grid Style) */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
              <h2 className="font-headline-lg text-headline-lg">Anime Populer</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter h-auto md:h-[500px]">
              {/* Main Feature */}
              <a 
                href="/anime/kimetsu-no-yaiba-sub-indo"
                className="md:col-span-2 relative rounded-xl overflow-hidden group cursor-pointer text-decoration-none h-[300px] md:h-full block border border-white/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjD923h0cKb5n0CD1i5cLoJ1qMc7Ns_lUrDVQ2WPiBt9ny0PIF_Xj6EL0Z4QI8fjjX4NDNaM5anUhE7AlOMN29dKSsCjXaaJnO9xMyKPSskCK0mc19JE7Y-1flNCKpIMcvjFyaSj4e4g_b6caNN7TjF3q15osd_9bAFZUkr-bACVoYsR9-MDZhKELOLbkMWSGeW7FQ_-6UFIjfPlDpj-0m_AmBQefcRzaWe4bxwCYkkybxjy3OdkfQCw"
                  alt="Demon Slayer: Infinity Castle"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 rounded mb-2 inline-block">Popular No. 1</span>
                  <h3 className="font-headline-lg text-white mb-2 text-xl md:text-2xl">Demon Slayer: Infinity Castle</h3>
                  <p className="text-on-surface-variant text-body-md line-clamp-2">Pertarungan akhir di kastil tanpa batas dimulai. Tanjiro dan para Hashira berhadapan dengan Muzan.</p>
                </div>
              </a>

              {/* Side Features */}
              <a 
                href="/?search=jujutsu+kaisen"
                className="md:col-span-1 relative rounded-xl overflow-hidden group cursor-pointer h-[240px] md:h-full block border border-white/5 text-decoration-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATpzvbVGqqwoDSCPtICM7uBYsY1ruuKl6942P2yiwxQ73EVnrFxQKjgWA3SVmFHYnr8kbNbyMkGa2DhlhOoEXFYNk7s_cVpgKUCtGubRjC-lZSmNDkBvJqCtajnPats8XNEsvWglXlmeARa7_bUa7xfpa5cdNThzx_m4zEHr1CML3uF0o5sUDc5hAaN32qdI77qz-Y3FRqo8QkwR4L5MQYxYMvgI4_aUoiypHDKo66mon7RyneplGpHg"
                  alt="Jujutsu Kaisen"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-headline-md text-white text-base md:text-lg">Jujutsu Kaisen</h3>
                </div>
              </a>

              <div className="md:col-span-1 flex flex-col gap-gutter h-full">
                <a 
                  href="/?search=one+piece"
                  className="relative rounded-xl overflow-hidden group cursor-pointer flex-1 h-[120px] md:h-0 block border border-white/5 text-decoration-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDttU6NvO-HbzffRDNIHK2zJIEnsEZv5M_3xQfkxygaTukVjWVmTMTqZ-v6YnAk1ECKzkplwUOR67KMfgm9xbzA_1g_NgIWdTkALLawDMKKSQplInsFTwS_fK5xr129qIA5HWejPI3klCQHTrVPE04YT2svfskHtFNdttDHOW26xIgeyDiKcgJNCLOprWy9Goifckpx7es6Cl_neqKLeCBhRdyQyEWnFhROFRbshd575Ftj30NtX4ZvEA"
                    alt="One Piece"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-headline-md text-white text-sm">One Piece</h3>
                  </div>
                </a>
                
                <a 
                  href="/?search=oshi+no+ko"
                  className="relative rounded-xl overflow-hidden group cursor-pointer flex-1 h-[120px] md:h-0 block border border-white/5 text-decoration-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsKJPNQD-I81jjVi6M13XxEE9MZwxCMDlZImqJNF8wrxAD7s0mhuriC26vc3_eUbQspAcA8VNkrdkZZ-xvlC64kkB57z2zdUs0wcdKicbeGR5TRMYS7P5mmjHOBzTOGXLduPt5Vdv5TDjItiw9pIlSRvt_CI84IScXkMfDy8OecMz_aPXa8SlpOiY5Ha9ilCXY_g6JXu6DAE81iG2qeRmZ5twfO7u0MsNM84rCiMv4TwmYjtwPIITZLA"
                    alt="Oshi no Ko"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-headline-md text-white text-sm">Oshi no Ko</h3>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Manga Terbaru */}
          <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 primary-gradient rounded-full"></div>
              <h2 className="font-headline-lg text-headline-lg">Manga Terbaru</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-gutter pb-6 custom-scrollbar scroll-smooth">
              {mangaList.map((manga, i) => (
                <div key={i} className="flex-none w-[180px] group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 anime-card-hover transition-all duration-300 border border-white/5">
                    {/* Themed gradient placeholder for manga cover since no real image is loaded */}
                    <div className={`w-full h-full bg-gradient-to-br ${manga.bg} flex flex-col items-center justify-between p-4`}>
                      <span className="material-symbols-outlined text-4xl text-primary mt-8 opacity-60">menu_book</span>
                      <div className="text-center">
                        <span className="text-[10px] font-bold tracking-widest text-primary/80 uppercase block mb-2">MANGA</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-high/85 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                      {manga.ch}
                    </div>
                  </div>
                  <h3 className="font-headline-md text-body-md line-clamp-1 group-hover:text-primary transition-colors text-center font-semibold">
                    {manga.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
