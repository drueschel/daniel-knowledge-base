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
                <div className="w-full my-6 flex flex-col items-center">
                  {/* Desktop View: Embedded PDF */}
                  <div className="hidden md:block w-full h-[800px] border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 relative">
                    <object 
                      data={props.src} 
                      type="application/pdf" 
                      className="w-full h-full absolute top-0 left-0"
                    >
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <p className="mb-4 text-gray-600">Dein Browser kann diese PDF nicht direkt anzeigen.</p>
                        <a 
                          href={props.src} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          PDF herunterladen / öffnen
                        </a>
                      </div>
                    </object>
                  </div>
                  
                  {/* Mobile View: Button Only (Since iOS/Android don't embed PDFs well) */}
                  <div className="md:hidden w-full p-6 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center">
                    <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-4 text-gray-700 font-medium">PDF Dokument</p>
                    <a 
                      href={props.src} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      PDF öffnen
                    </a>
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
