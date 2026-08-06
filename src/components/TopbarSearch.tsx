'use client';

import { usePathname } from 'next/navigation';
import SearchBox from './SearchBox';

export default function TopbarSearch({ lang }: { lang: string }) {
  const pathname = usePathname();
  
  // Hide on the home page (e.g. "/de" or "/en")
  if (pathname === `/${lang}`) {
    return null;
  }
  
  return <SearchBox lang={lang} />;
}
