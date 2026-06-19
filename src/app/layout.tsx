import type { Metadata } from "next";
import "./globals.css";
import { DesktopNavbar, MobileNavbar } from "./Navbar";

export const metadata: Metadata = {
  title: "PisNime Flix - Premium Anime Streaming",
  description: "Website streaming anime dan baca manga Subtitle Indonesia gratis terlengkap dengan kualitas HD dan kecepatan tinggi.",
  keywords: "streaming anime, anime sub indo, nonton anime, otakudesu, samehadaku, anime indonesia, manga indo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark custom-scrollbar">
      <head>
        {/* Import external fonts & symbols */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Hanken+Grotesk:wght@400;500&family=Geist:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col">
        {/* TopAppBar */}
        <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-md">
          <div className="flex justify-between items-center px-6 md:px-margin-desktop py-4 max-w-container-max mx-auto">
            <div className="flex items-center gap-12">
              <a className="font-display-lg text-headline-md font-extrabold text-primary tracking-tighter text-decoration-none" href="/">
                PisNime Flix
              </a>
              {/* Dynamic Desktop Navigation */}
              <DesktopNavbar />
            </div>
            <div className="flex items-center gap-6">
              {/* Native Search Bar */}
              <form action="/" method="GET" className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:border-primary transition-all group w-64">
                <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary">search</span>
                <input 
                  name="search" 
                  type="text"
                  placeholder="Cari anime terfavorit..." 
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-label-sm w-full placeholder:text-on-surface-variant/50 ml-2 text-on-surface"
                  autoComplete="off"
                  required
                />
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow pt-24 pb-32">
          {children}
        </main>

        {/* Dynamic Mobile Bottom Navigation */}
        <MobileNavbar />

        {/* Footer */}
        <footer className="w-full py-stack-lg bg-surface-container-lowest border-t border-outline-variant mt-16 pb-24 md:pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-margin-desktop max-w-container-max mx-auto gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-display-lg text-headline-md font-extrabold text-primary mb-4">PisNime Flix</span>
              <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left max-w-sm">
                Platform streaming anime premium dengan kualitas terbaik dan update tercepat di Indonesia.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <div className="flex flex-wrap justify-center gap-6 mb-4">
                <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
                <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
                <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">Help Center</a>
                <a className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary underline opacity-80 hover:opacity-100 transition-opacity" href="#">Contact Us</a>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant/60 text-center">
                © {new Date().getFullYear()} PisNime Flix Streaming. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
