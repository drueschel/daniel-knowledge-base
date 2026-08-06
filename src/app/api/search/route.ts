import { NextResponse } from 'next/server';
import { getAllContent } from '@/lib/markdown';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lang = searchParams.get('lang');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const allContent = getAllContent();
  const lowerQuery = query.toLowerCase();

  const searchResults = allContent
    .filter(item => {
      // If a lang is provided, only match that language
      if (lang && item.lang !== lang) return false;

      return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
      );
    })
    .map(item => {
      // Generate a snippet of text around the first match
      let snippet = '';
      const contentLower = item.content.toLowerCase();
      const matchIndex = contentLower.indexOf(lowerQuery);

      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 60);
        const end = Math.min(item.content.length, matchIndex + 60 + lowerQuery.length);
        snippet = item.content.substring(start, end).replace(/\n/g, ' ');
        if (start > 0) snippet = '...' + snippet;
        if (end < item.content.length) snippet = snippet + '...';
      } else {
        // If match was only in title, just grab the start of the content
        snippet = item.content.substring(0, 120).replace(/\n/g, ' ') + '...';
      }

      return {
        title: item.title,
        url: `/${item.lang}/${item.slug.join('/')}`,
        snippet,
        lang: item.lang
      };
    });

  return NextResponse.json({ results: searchResults });
}
