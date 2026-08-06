import { getSidebarNavigation } from '@/lib/markdown';
import Sidebar from '@/components/Sidebar';
import LangSwitcher from '@/components/LangSwitcher';

export async function generateStaticParams() {
  return [{ lang: 'de' }, { lang: 'en' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const nav = getSidebarNavigation(lang);

  return (
    <div className="layout">
      <Sidebar nav={nav} lang={lang} currentSlug={`/${lang}`} />
      
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            DKB Knowledge Base
          </div>
          <LangSwitcher currentLang={lang} />
        </header>
        
        <div className="content-inner">
          {children}
        </div>
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--background);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .breadcrumb {
          font-weight: 600;
          color: var(--text-muted);
        }
        .content-inner {
          padding: 2.5rem;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
          .topbar {
            padding: 1rem;
          }
          .content-inner {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
