import React from 'react';
import { ArrowLeft, Headphones, PlayCircle, Mic2 } from 'lucide-react';

const podcastSections = [
  { title: 'Tecnologías Emergentes', subtitle: 'Herramientas digitales para explorar y enseñar física', description: 'En este espacio se publicarán los episodios sobre tecnologías emergentes, simuladores, análisis de datos y recursos digitales.', icon: PlayCircle },
  { title: 'Lara E-learning', subtitle: 'Aprendizaje en entornos digitales', description: 'Un espacio para compartir contenidos y conversaciones sobre aprendizaje electrónico y experiencias formativas en línea.', icon: Headphones },
  { title: 'B-learning', subtitle: 'Aprendizaje combinado', description: 'Episodios sobre la integración de actividades presenciales y recursos digitales para enriquecer la enseñanza.', icon: Mic2 },
];

export default function PodcastPage() {
  return <div className="min-h-screen bg-stone-50 text-stone-900">
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <a href="/pagina-/" className="font-serif text-xl font-semibold tracking-wide">LEAF <span className="text-sm font-normal text-amber-800">2026—2030</span></a>
        <a href="/pagina-/" className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800"><ArrowLeft size={16}/> Volver al Campus</a>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-amber-800">Generación 2026—2030 · Audio y conversación</p>
      <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Podcast LEAF.<br/><span className="italic text-stone-500">Ideas que se escuchan.</span></h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">Un espacio para reunir episodios, entrevistas y recursos de aprendizaje en audio y video. Los enlaces se incorporarán conforme estén disponibles.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {podcastSections.map((section, index) => {
          const Icon = section.icon;
          return <article key={section.title} className="flex min-h-72 flex-col border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><Icon size={24}/></div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Espacio 0{index + 1}</p>
            <h2 className="mt-2 font-serif text-2xl">{section.title}</h2>
            <p className="mt-3 text-sm font-semibold text-amber-900">{section.subtitle}</p>
            <p className="mt-4 flex-1 text-sm leading-6 text-stone-600">{section.description}</p>
            <div className="mt-6 border-t border-stone-200 pt-4 text-xs text-stone-500">Próximamente · Enlace del episodio pendiente</div>
          </article>;
        })}
      </div>
    </main>
    <footer className="border-t border-stone-200 px-5 py-6 text-center text-xs tracking-widest text-stone-500">LEAF 2026—2030 · PODCAST</footer>
  </div>;
}
