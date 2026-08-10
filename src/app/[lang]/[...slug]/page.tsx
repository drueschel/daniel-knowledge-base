import { getAllContent, getContentBySlug } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Highlighter from '@/components/Highlighter';
import { Suspense } from 'react';

export async function generateStaticParams() {
  const content = getAllContent();
  return content.map((c) => ({
    lang: c.lang,
    slug: c.slug,
  }));
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  const post = getContentBySlug(lang, slug);

  if (!post) {
    notFound();
  }

  // If the markdown starts with # Title, we remove it because we might want to style it,
  // but react-markdown will render it fine inside <div className="markdown">.

  return (
    <article className="markdown">
      <Suspense fallback={null}>
        <Highlighter />
      </Suspense>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={{
          iframe: ({ node, ...props }) => {
            if (typeof props.src === 'string' && props.src.endsWith('.pdf')) {
              return (
                <div className="flex flex-col gap-4 my-6">
                  {/* Mobile-friendly fallback button */}
                  <a 
                    href={props.src} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="md:hidden flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                    PDF im Vollbild öffnen (Mobile)
                  </a>
                  
                  {/* Desktop iframe, hidden on small screens to prevent iOS scrolling issues */}
                  <div className="hidden md:block w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                    <iframe {...props} className="w-full min-h-[800px] border-0" />
                  </div>
                </div>
              );
            }
            return <iframe {...props} />;
          }
        }}
      >
        {post.content}
      </ReactMarkdown>
    </article>
  );
}
