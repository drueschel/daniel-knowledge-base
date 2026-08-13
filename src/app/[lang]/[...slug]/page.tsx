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
              // Ensure we hide navpanes and fit to width so the PDF is as wide as possible
              const optimizedSrc = props.src.includes('#') ? props.src : `${props.src}#navpanes=0&view=FitH`;
              
              return (
                <div style={{ margin: '2rem 0' }}>
                  <style>{`
                    .pdf-desktop { display: none; }
                    .pdf-mobile { display: block; }
                    @media (min-width: 768px) {
                      .pdf-desktop { display: block; }
                      .pdf-mobile { display: none; }
                    }
                  `}</style>
                  
                  {/* DESKTOP VIEW - Exactly as it was originally in the markdown */}
                  <div className="pdf-desktop">
                    <iframe {...props} src={optimizedSrc} />
                  </div>

                  {/* MOBILE VIEW - Optimization (Functional fallback + Preview) */}
                  <div className="pdf-mobile">
                    {/* Mobile Preview */}
                    <div style={{ 
                      width: '100%', 
                      height: '450px', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '0.75rem', 
                      backgroundColor: '#f8fafc',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      <iframe {...props} src={optimizedSrc} style={{ width: '100%', height: '100%', border: 'none' }} />
                    </div>
                    
                    {/* Mobile Fallback Button */}
                    <div style={{ 
                      width: '100%', 
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <a 
                        href={props.src} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '500',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        PDF öffnen
                      </a>
                    </div>
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
