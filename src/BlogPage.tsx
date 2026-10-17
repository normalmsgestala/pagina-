import { EmergingTechSection } from './components/EmergingTechSection';
import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, BookOpen } from 'lucide-react';

const posts = [
 {category:'Comunidad',title:'Un nuevo capítulo comienza aquí',excerpt:'Un espacio para compartir ideas, experiencias y todo lo que hace única a nuestra generación 2026–2030.',date:'EDICIÓN 2026–2030',image:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85'},
 {category:'Física',title:'La física también se aprende experimentando',excerpt:'Simuladores, preguntas y actividades que nos ayudan a llevar los conceptos del salón a experiencias interactivas.',date:'RECURSOS DE APRENDIZAJE',image:'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=80'},
 {category:'Vida estudiantil',title:'Ideas para organizar tu semestre',excerpt:'Estrategias sencillas para planear el estudio, trabajar en equipo y aprovechar mejor cada clase.',date:'GUÍA ESTUDIANTIL',image:'https://images.unsplash.com/photo-1455390582262-044cdae0bbc7?auto=format&fit=crop&w=900&q=80'},
 {category:'Comunidad',title:'Las historias que también merecen contarse',excerpt:'Proyectos, recomendaciones, aprendizajes y voces de estudiantes: este espacio se construye entre todos.',date:'PARTICIPA',image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'},
];
export default function BlogPage(){
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('Todo');
 const [active,setActive]=useState<(typeof posts)[number]|null>(null);
 const filtered=useMemo(()=>posts.filter(p=>(category==='Todo'||p.category===category)&&(p.title+' '+p.excerpt+' '+p.category).toLowerCase().includes(query.toLowerCase())),[query,category]);
 return <div className="min-h-screen bg-stone-50 text-stone-900">
  <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><a href="/pagina-/" className="font-serif text-xl font-semibold tracking-wide">LEAF <span className="text-sm font-normal text-amber-800">2026—2030</span></a><a href="/pagina-/" className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-800"><ArrowLeft size={16}/> Volver a los simuladores</a></div></header>
  <main className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
   <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-amber-800">Generación 2026—2030 · Blog estudiantil</p>
   <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Lo que vivimos.<br/><span className="italic text-stone-500">Lo que aprendemos.</span></h1>
   <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">Noticias, proyectos, recursos de física y experiencias de nuestra comunidad normalista.</p>
   <div className="mt-10 flex flex-col gap-4 border-y border-stone-200 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap gap-2">{['Todo','Comunidad','Física','Vida estudiantil'].map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'rounded-full bg-stone-900 px-4 py-2 text-sm text-white':'rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:border-stone-800'}>{c}</button>)}</div>
    <label className="flex items-center gap-2 border-b border-stone-300 py-2 text-stone-500"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar artículos..." className="w-full bg-transparent text-sm outline-none sm:w-48"/></label>
   </div>
   <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((p,i)=><button key={p.title} onClick={()=>setActive(p)} className="group overflow-hidden text-left"><div className="aspect-[4/3] overflow-hidden bg-stone-200"><img src={p.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div><div className="py-4"><p className="text-xs uppercase tracking-widest text-amber-800">{p.category} · {p.date}</p><h2 className="mt-3 font-serif text-2xl leading-snug">{p.title}</h2><p className="mt-3 text-sm leading-6 text-stone-600">{p.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Leer historia <ArrowRight size={15}/></span></div></button>)}</div>
   {filtered.length===0&&<p className="py-12 text-stone-600">No encontramos artículos con esa búsqueda.</p>}
   <EmergingTechSection />
   <section className="mt-16 flex flex-col gap-4 bg-stone-900 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10"><div><p className="text-xs uppercase tracking-widest text-stone-300">¿Tienes una idea?</p><h2 className="mt-2 font-serif text-3xl">Este espacio también es tuyo.</h2></div><a href="https://github.com/normalmsgestala/pagina-/issues" className="inline-flex items-center gap-2 text-sm underline underline-offset-4">Propón una historia <ArrowRight size={16}/></a></section>
  </main><footer className="border-t border-stone-200 px-5 py-6 text-center text-xs tracking-widest text-stone-500">LEAF 2026—2030 · HECHO EN COMUNIDAD</footer>
  {active&&<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" onClick={()=>setActive(null)}><article className="my-8 w-full max-w-2xl bg-stone-50 p-6 sm:p-10" onClick={e=>e.stopPropagation()}><button className="mb-5 text-sm underline" onClick={()=>setActive(null)}>Cerrar artículo</button><img src={active.image} alt="" className="mb-6 max-h-72 w-full object-cover"/><p className="text-xs uppercase tracking-widest text-amber-800">{active.category} · {active.date}</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">{active.title}</h2><p className="mt-5 leading-8 text-stone-600">{active.excerpt}</p><p className="mt-4 leading-8 text-stone-600">Este espacio comparte experiencias, ideas y recursos útiles para nuestra generación. Las publicaciones se irán construyendo con las aportaciones de estudiantes y docentes.</p></article></div>}
 </div>
}
