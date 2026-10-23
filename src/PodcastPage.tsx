import React from 'react';
import { formatDate, usePublicPosts, youtubeId } from './lib/api';
import { ArrowLeft, Headphones, PlayCircle, Mic2, BarChart3 } from 'lucide-react';

const podcastSections = [
  { title: 'Tecnologías Emergentes', subtitle: 'Herramientas digitales para explorar y enseñar física', description: 'Episodios sobre tecnologías emergentes, simuladores, análisis de datos y recursos digitales.', videoId: '4Anb4UotavI', videoUrl: 'https://youtu.be/4Anb4UotavI', icon: PlayCircle },
  { title: 'Lara E-learning', subtitle: 'Aprendizaje en entornos digitales', description: 'Contenidos sobre aprendizaje electrónico y experiencias formativas en línea.', videoId: 'xZKJpxZ66yQ', videoUrl: 'https://youtu.be/xZKJpxZ66yQ', icon: Headphones },
  { title: 'B-learning', subtitle: 'Aprendizaje combinado', description: 'Episodios sobre la integración de actividades presenciales y recursos digitales para enriquecer la enseñanza.', videoId: 'lpYOVKu_sdI', videoUrl: 'https://youtu.be/lpYOVKu_sdI', icon: Mic2 },
  { title: 'Aprendizaje Adaptativo y Analítica Educativa', subtitle: 'Datos para personalizar el aprendizaje', description: 'Un espacio sobre el uso de datos educativos para comprender el progreso, adaptar experiencias y apoyar decisiones de enseñanza.', videoId: 'k5m2uqZP-0o', videoUrl: 'https://youtu.be/k5m2uqZP-0o', icon: BarChart3 },
];

export default function PodcastPage() {
  const episodes = usePublicPosts('podcast');
  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <a href="/" className="font-serif text-xl font-semibold tracking-wide">LEAF <span className="text-sm font-normal text-amber-800">2026—2030</span></a>
        <a href="/" className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800"><ArrowLeft size={16}/> Volver al Campus</a>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-amber-800">Generación 2026—2030 · Audio y conversación</p>
      <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Podcast LEAF.<br/><span className="italic text-stone-500">Ideas que se escuchan.</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">Un espacio para reunir episodios, entrevistas y recursos de aprendizaje en audio y video.</p>
      <section className="mt-10 grid gap-4 border-y border-stone-200 py-6 sm:grid-cols-3">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">01 · Planeación</p><h2 className="mt-2 font-serif text-xl">Idea y guion</h2><p className="mt-2 text-sm leading-6 text-stone-600">Cada episodio parte de un propósito didáctico, público definido y una escaleta con apertura, desarrollo, ejemplo y cierre.</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">02 · Producción</p><h2 className="mt-2 font-serif text-xl">Escenas y continuidad</h2><p className="mt-2 text-sm leading-6 text-stone-600">Los guiones, escenas y recursos visuales deben conservar coherencia narrativa y verificar los datos científicos o educativos que se comuniquen.</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-800">03 · Publicación</p><h2 className="mt-2 font-serif text-xl">Registro y fuentes</h2><p className="mt-2 text-sm leading-6 text-stone-600">Al publicar se registra el enlace final, título, descripción, fecha y créditos. Las ideas o guiones en proceso no se presentan como episodios publicados.</p></div>
      </section>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {podcastSections.map((section, index) => {
          const Icon = section.icon;
          return <article key={section.title} className="flex min-h-72 flex-col border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><Icon size={24}/></div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Espacio 0{index + 1}</p>
            <h2 className="mt-2 font-serif text-2xl">{section.title}</h2>
            <p className="mt-3 text-sm font-semibold text-amber-900">{section.subtitle}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{section.description}</p>
            <div className="mt-5 w-full overflow-hidden rounded-xl border border-stone-200 bg-black shadow-sm"><iframe className="block w-full aspect-video" src={`https://www.youtube.com/embed/${section.videoId}`} title={`Reproductor integrado: ${section.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
            <a href={section.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-900"><PlayCircle size={17}/> Ver video en YouTube <span aria-hidden="true">↗</span></a>
          </article>;
        })}
      </div>
      {episodes.length > 0 && <section className="mt-16 border-t border-stone-200 pt-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Episodios de la generación</p>
        <h2 className="mt-2 font-serif text-3xl">Nuevos episodios</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {episodes.map(ep => {
            const vid = youtubeId(ep.url);
            return <article key={ep.id} className="flex flex-col border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{ep.data?.section || 'Podcast'}{ep.data?.duration ? ' · ' + ep.data.duration : ''}</p>
              <h3 className="mt-2 font-serif text-2xl">{ep.title}</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{ep.summary}</p>
              <p className="mt-3 text-xs text-stone-500">Con {ep.data?.participants || ep.authorName} · {formatDate(ep.publishedAt)}</p>
              {vid && <div className="mt-5 w-full overflow-hidden rounded-xl border border-stone-200 bg-black"><iframe className="block w-full aspect-video" src={`https://www.youtube.com/embed/${vid}`} title={ep.title} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}
              <a href={ep.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-900"><PlayCircle size={17}/> Escuchar episodio <span aria-hidden="true">↗</span></a>
            </article>;
          })}
        </div>
      </section>}
    </main>
    <footer className="border-t border-stone-200 px-5 py-6 text-center text-xs tracking-widest text-stone-500">LEAF 2026—2030 · PODCAST</footer>
  </div>;
}
