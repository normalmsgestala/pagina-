import React from 'react';
import { Clapperboard, Cpu, Cog, DraftingCompass, Palette, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

const characters = [
 {name:'Escuadrón del Erizo Morado', role:'Tecnologías emergentes', icon:Cpu, detail:'El cerebro digital del parque: pantallas, tablets, Tracker, PhET y registro de datos para convertir las mediciones en experiencias interactivas.', color:'border-violet-300 bg-violet-50 text-violet-900'},
 {name:'Escuadrón de la Ardilla Rosa', role:'Ingeniería y mecánica', icon:Cog, detail:'El equipo constructor: ensambla y prueba las maquetas físicas para que las atracciones funcionen con estabilidad y seguridad.', color:'border-pink-300 bg-pink-50 text-pink-900'},
 {name:'Escuadrón del Cuervo Pico', role:'Académica y álgebra', icon:DraftingCompass, detail:'El equipo investigador: desarrolla ecuaciones, redacta documentos, analiza los fenómenos físicos y revisa el margen de error.', color:'border-sky-300 bg-sky-50 text-sky-900'},
 {name:'Escuadrón del Mapache Tato', role:'Didáctica, arte y logística', icon:Palette, detail:'Transforma la física en una experiencia divertida: diseña la ambientación, organiza el espacio y prepara explicaciones para el público.', color:'border-amber-300 bg-amber-50 text-amber-900'},
 {name:'Coordinación del Campus', role:'El Zorro Dr. y el Búho', icon:GraduationCap, detail:'La coordinación general dirige la integración del parque; la figura docente acompaña, orienta y evalúa el proceso académico.', color:'border-emerald-300 bg-emerald-50 text-emerald-900'},
];

export function CircusProjectIntro(){
 return <section className="circus-intro overflow-hidden rounded-3xl border-4 border-double border-amber-300 shadow-xl">
  <div className="circus-marquee px-5 py-6 sm:px-8 sm:py-9 text-center">
   <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/15 px-4 py-1.5 text-xs font-black uppercase tracking-[.2em] text-white"><Sparkles size={14}/> Campus LEAF presenta</div>
   <h2 className="mt-4 font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl">¡Bienvenidos al Parque!</h2>
   <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-amber-50 sm:text-base">Una aventura de física, creatividad y aprendizaje. ¡Que comience la función!</p>
   <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-950"><Clapperboard size={15}/> Presentación del proyecto</div>
  </div>
  <div className="bg-[#fffaf0] p-4 sm:p-7">
   <figure className="mb-7 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-lg"><img src="/pagina-/images/campus-leaf.jpg" alt="Bienvenidos al Campus LEAF: personajes y entrada del proyecto El Parque" className="block h-auto w-full object-cover" /><figcaption className="px-4 py-3 text-center text-sm font-semibold text-red-950">¡Bienvenidos al Campus Circus LEAF!</figcaption></figure>
   <div className="mb-4 flex items-center gap-2"><BookOpen size={18} className="text-red-800"/><h3 className="font-display text-xl font-bold text-red-950">El elenco del Campus Circus</h3></div>
   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{characters.map((c)=>{const Icon=c.icon;return <article key={c.name} className={`rounded-2xl border p-4 ${c.color}`}><div className="flex items-start gap-3"><span className="rounded-xl bg-white/80 p-2"><Icon size={21}/></span><div><h4 className="font-display text-base font-bold leading-snug">{c.name}</h4><p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider opacity-75">{c.role}</p></div></div><p className="mt-3 text-sm leading-6 text-stone-700">{c.detail}</p></article>})}</div>
   <div className="mt-5 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-lg"><div className="bg-red-950 px-5 py-4 text-center"><Clapperboard className="mx-auto text-amber-300" size={27}/><h3 className="mt-2 font-display text-lg font-bold text-white">Video de introducción</h3><p className="mt-1 text-sm text-amber-100">Conoce el Campus Circus LEAF</p></div><div className="aspect-video w-full bg-black"><iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/aXPCCS6i318" title="Presentación del proyecto Campus Circus LEAF" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><p className="p-3 text-center text-xs text-stone-500">Pulsa reproducir para ver la presentación del proyecto.</p></div>
  </div>
 </section>
}
