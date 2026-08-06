import SearchBox from '@/components/SearchBox';

export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';
  
  return (
    <div className="markdown" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>
        {isEn ? 'Welcome to the Knowledge Base' : 'Willkommen in der Wissensdatenbank'}
      </h1>
      <p style={{ marginBottom: '3rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
        {isEn 
          ? 'Search for topics below or select one from the sidebar to start reading.' 
          : 'Suche unten nach Themen oder wähle eines aus der Seitenleiste aus, um zu beginnen.'}
      </p>
      
      <SearchBox lang={lang} large={true} />
    </div>
  );
}
