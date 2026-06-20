# 🎬 PisNime Flix - Premium Anime Streaming Platform

PisNime Flix adalah platform streaming anime premium subtitle Indonesia yang dibangun menggunakan **Next.js** dan **React**. Platform ini mengintegrasikan mesin scraper dinamis untuk menyajikan rilis anime ongoing terupdate, daftar film anime (movies), jadwal rilis mingguan, serta pemutar video (*streaming player*) interaktif dengan dukungan berbagai kualitas resolusi cermin (*mirror links*).

---

## ✨ Fitur Utama

- 🏠 **Beranda Premium**: Desain modern Netflix-style dilengkapi dengan *Bento Grid* interaktif untuk anime populer, daftar tontonan *ongoing* terupdate, slide manga terbaru, dan banner sorotan (*hero banner*) beranimasi.
- 📅 **Jadwal Rilis Mingguan**: Jadwal penayangan yang dikelompokkan secara dinamis per hari (Senin s.d. Minggu). Sistem mendeteksi hari lokal pengguna untuk menyoroti jadwal hari ini secara otomatis.
- 🎥 **Pusat Film (Movies)**: Halaman khusus yang menyaring dan menampilkan rilis film layar lebar (*theatrical/BD movies*) seperti *Kimi no Na wa*, *SAO Ordinal Scale*, *No Game No Life Zero*, dll.
- 🔍 **Pencarian & Filter Pintar**: Navigasi pencarian judul anime secara instan, dipadukan dengan panel penyaringan (Genre, Status Ongoing/Completed, Tipe, dan Urutan).
- 📺 **Pemutar Video & Pilihan Resolusi**: Halaman tontonan video dengan integrasi pemutar (*embedded player*) pendukung beberapa pilihan kualitas video (360p, 480p, 720p) yang diparsing langsung dari server *cermin*.
- 📖 **Manga Coming Soon Page**: Halaman *maintenance* premium untuk fitur pembaca manga dengan status pengembangan fitur serta formulir langganan notifikasi email interaktif.

---

## 🛠️ Teknologi yang Digunakan

* **Core Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) & [React 19](https://react.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
* **HTML Parsing & Scraper**: [Cheerio](https://cheerio.js.org/) & [Axios](https://axios-http.com/)
* **Icons**: [Google Material Symbols](https://fonts.google.com/icons)

---

## 🚀 Cara Instalasi dan Menjalankan Proyek

### 1. Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18 atau lebih tinggi) di sistem Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/daffaislamynaufal/PisNimeFLIX.git
cd PisNimeFLIX
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env.local` di direktori utama proyek Anda dan tambahkan konfigurasi target URL scraper:
```env
OTAKUDESU_BASE_URL=https://otakudesu.blog
```

### 5. Jalankan Server Pengembangan
Jalankan proyek dalam mode *development*:
```bash
npm run dev
# Atau untuk memaksa port tertentu misalnya 3002:
npx next dev -p 3002
```
Buka [http://localhost:3002](http://localhost:3002) di browser Anda untuk melihat hasilnya.

### 6. Build Produksi
Untuk mengompilasi dan mengoptimalkan aplikasi untuk lingkungan produksi:
```bash
npm run build
npm start
```

---

## 📁 Struktur Direktori

```text
├── src/
│   ├── app/
│   │   ├── anime/            # Katalog anime, filter/pencarian, dan detail info anime berdasarkan ID
│   │   ├── api/              # API Endpoint lokal pendukung scraper
│   │   ├── manga/            # Halaman maintenance baca manga
│   │   ├── movies/           # Katalog film layar lebar (movies)
│   │   ├── schedule/         # Jadwal rilis mingguan dinamis
│   │   ├── watch/            # Halaman streaming & pemutar video
│   │   ├── layout.tsx        # Shell tata letak global (Header, Navbars, Footer)
│   │   ├── Navbar.tsx        # Navigasi Desktop & Mobile Client-side
│   │   ├── globals.css       # CSS utama & Token Desain
│   │   └── page.tsx          # Beranda utama
│   └── lib/
│       └── scraper.ts        # Logika parsing & in-memory cache Otakudesu
├── public/                   # Aset gambar & static file
├── tailwind.config.js        # Konfigurasi kustom tema Tailwind CSS
└── package.json              # Dependensi proyek & skrip npm
```

---

## 📝 Lisensi
Proyek ini dibuat untuk tujuan pembelajaran dan pengembangan pribadi. Segala konten media anime yang disajikan diperoleh secara dinamis dari penyedia pihak ketiga melalui proses scraping publik.
