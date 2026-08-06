import { getSidebarNavigation } from '@/lib/markdown';
import Sidebar from '@/components/Sidebar';
import LangSwitcher from '@/components/LangSwitcher';
import Breadcrumbs from '@/components/Breadcrumbs';
import TopbarSearch from '@/components/TopbarSearch';

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
      <Sidebar nav={nav} lang={lang} />
      
      <main className="main-content">
        <header className="topbar">
          <Breadcrumbs nav={nav} />
          <div className="topbar-right">
            <TopbarSearch lang={lang} />
            <LangSwitcher currentLang={lang} />
          </div>
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
          margin-left: 310px; /* Sidebar width */
          width: calc(100vw - 310px);
          display: flex;
          flex-direction: column;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 4rem; /* More generous margins left/right */
          border-bottom: 1px solid var(--border-color);
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
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
            width: 100vw;
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
