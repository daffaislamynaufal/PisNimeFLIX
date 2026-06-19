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
  const chapterDetail = await fetchChapterDetail(slug);

  if (!chapterDetail) {
    notFound();
  }

  // Fetch the main comic detail using the chapterList property (which is the comic slug)
  // to get all chapters for the switcher dropdown
  const comicSlug = chapterDetail.navigation.chapterList;
  const comicDetail = await fetchComicDetail(comicSlug);

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
