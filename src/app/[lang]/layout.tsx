import { getSidebarNavigation, getRouteMappings } from '@/lib/markdown';
import Sidebar from '@/components/Sidebar';
import LangSwitcher from '@/components/LangSwitcher';
import Breadcrumbs from '@/components/Breadcrumbs';
import TopbarSearch from '@/components/TopbarSearch';
import { MobileMenuProvider } from '@/components/MobileMenuContext';
import HamburgerMenu from '@/components/HamburgerMenu';

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
  const routeMappings = getRouteMappings();

  return (
    <MobileMenuProvider>
      <div className="layout">
        <Sidebar nav={nav} lang={lang} />
        
        <main className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <HamburgerMenu />
              <div className="breadcrumbs-container">
                <Breadcrumbs nav={nav} />
              </div>
            </div>
            <div className="topbar-right">
              <TopbarSearch lang={lang} />
              <LangSwitcher currentLang={lang} routeMappings={routeMappings} />
            </div>
          </header>
          
          <div className="content-inner">
            {children}
          </div>
        </main>

      <style>{`
        .layout {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }
        .main-content {
          margin-left: 310px; /* Sidebar width */
          width: calc(100% - 310px);
          max-width: calc(100% - 310px);
          display: flex;
          flex-direction: column;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem; /* Reduced padding to prevent overflow on medium screens */
          border-bottom: 1px solid var(--border-color);
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }
        .breadcrumbs-container {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 1; /* Allow shrinking so it doesn't overflow */
          min-width: 0;
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
            width: 100%;
            max-width: 100%;
          }
          .topbar {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .topbar-left {
            flex: 1;
            min-width: 0;
          }
          .topbar-right {
            flex-shrink: 0;
            gap: 0.5rem;
          }
          .content-inner {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
      </div>
    </MobileMenuProvider>
  );
}
