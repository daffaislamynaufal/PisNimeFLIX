'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MangaMaintenancePage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email tidak boleh kosong');
      return;
    }
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return;
    }

    setError('');
    setIsSubmitted(true);
    setEmail('');
    
    // Auto reset success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
      {/* Premium Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Animated Manga/Book Icon Container */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface-container/60 border border-white/10 shadow-2xl mb-8 relative group hover:border-primary/40 transition-colors duration-500">
          <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-md group-hover:bg-primary/20 transition-all duration-500"></div>
          <span className="material-symbols-outlined text-5xl text-primary animate-bounce relative z-10" style={{ animationDuration: '3s' }}>
            menu_book
          </span>
        </div>

        {/* Badge */}
        <div className="inline-block mb-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest border border-primary/20 shadow-sm shadow-primary/5">
            Dalam Perbaikan & Pengembangan
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display-lg text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Manga Reader Sedang <span className="text-transparent bg-clip-text primary-gradient">Dipersiapkan</span>
        </h1>

        {/* Description */}
        <p className="font-body-md text-base text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
          Kami sedang menghubungkan API Manga baru dan merancang antarmuka pembaca komik resolusi tinggi yang nyaman dibaca melalui ponsel maupun komputer. Pantau terus perkembangannya!
        </p>

        {/* Custom Feature Progress Status */}
        <div className="bg-surface-container/30 border border-white/5 rounded-2xl p-6 mb-10 max-w-lg mx-auto backdrop-blur-md">
          <h3 className="text-white font-semibold text-sm mb-4 text-left flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">construction</span>
            Status Pengembangan Fitur:
          </h3>
          
          <div className="space-y-4">
            {/* API Integration Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface-variant">Integrasi API Scraper Manga</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="w-full bg-surface-container-high/50 rounded-full h-2 overflow-hidden">
                <div className="primary-gradient h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Reader Interface Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface-variant">Desain Pembaca & Mode Gelap</span>
                <span className="text-primary">60%</span>
              </div>
              <div className="w-full bg-surface-container-high/50 rounded-full h-2 overflow-hidden">
                <div className="primary-gradient h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Database Sync Progress */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-on-surface-variant">Sinkronisasi Bookmark & Riwayat Baca</span>
                <span className="text-primary">40%</span>
              </div>
              <div className="w-full bg-surface-container-high/50 rounded-full h-2 overflow-hidden">
                <div className="primary-gradient h-full rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notify Form */}
        <div className="max-w-md mx-auto mb-10">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Masukkan email Anda..."
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-on-surface-variant/40 transition-colors"
                />
                {error && (
                  <span className="absolute -bottom-6 left-1 text-[10px] text-red-500 font-semibold">
                    {error}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="primary-gradient px-6 py-3 rounded-xl font-bold text-white text-xs hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex-shrink-0 cursor-pointer border-none"
              >
                Kabari Saya
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Terima kasih! Kami akan mengirimkan notifikasi saat fitur Manga dirilis.
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="bg-surface-container/60 backdrop-blur-md px-6 py-3 rounded-xl font-bold text-white border border-outline-variant hover:bg-surface-container hover:border-primary/30 transition-all flex items-center gap-2 text-decoration-none text-xs"
          >
            <span className="material-symbols-outlined text-sm">home</span>
            Kembali ke Beranda
          </Link>
          <Link
            href="/anime-list"
            className="primary-gradient px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all neon-glow text-decoration-none text-xs border-none"
          >
            <span className="material-symbols-outlined text-sm">movie</span>
            Tonton Anime
          </Link>
        </div>
      </div>
    </div>
  );
}
