import React from 'react';
import { fetchChapterDetail, fetchComicDetail } from '@/lib/scraper';
import { notFound } from 'next/navigation';
import ReaderLayout from './ReaderLayout';

interface ComicReadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ComicReadPageProps) {
  const { slug } = await params;
  const chapter = await fetchChapterDetail(slug);
  if (!chapter) return { title: 'Chapter Tidak Ditemukan - PisNime Flix' };

  return {
    title: `Baca ${chapter.manga_title} ${chapter.chapter_title} Bahasa Indonesia - PisNime Flix`,
    description: `Baca komik ${chapter.manga_title} ${chapter.chapter_title} terjemahan Bahasa Indonesia gratis di PisNime Flix.`,
  };
}

export default async function ComicReadPage({ params }: ComicReadPageProps) {
  const { slug } = await params;
  
  // Predict the comic slug from the chapter slug to enable parallel fetching
  const predictedComicSlug = slug.includes('-chapter-') ? slug.split('-chapter-')[0] : '';
  
  // Fetch both endpoints in parallel to cut loading latency in half
  const [chapterDetail, preComicDetail] = await Promise.all([
    fetchChapterDetail(slug),
    predictedComicSlug ? fetchComicDetail(predictedComicSlug) : Promise.resolve(null)
  ]);

  if (!chapterDetail) {
    notFound();
  }

  const comicSlug = chapterDetail.navigation.chapterList || predictedComicSlug;
  
  // Fallback: if the prediction was wrong or not loaded, fetch sequentially
  let comicDetail = preComicDetail;
  if (!comicDetail && comicSlug) {
    comicDetail = await fetchComicDetail(comicSlug);
  }

  if (!comicDetail) {
    notFound();
  }

  return (
    <ReaderLayout
      chapterDetail={chapterDetail}
      comicDetail={{
        slug: comicSlug,
        title: comicDetail.title,
        chapters: comicDetail.chapters || [],
      }}
      currentSlug={slug}
    />
  );
}
