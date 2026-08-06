export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';
  
  return (
    <div className="markdown">
      <h1>{isEn ? 'Welcome to the Knowledge Base' : 'Willkommen in der Wissensdatenbank'}</h1>
      <p>
        {isEn 
          ? 'Select a topic from the sidebar to start reading.' 
          : 'Wähle ein Thema aus der Seitenleiste aus, um zu beginnen.'}
      </p>
    </div>
  );
}
