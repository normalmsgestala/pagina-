import React, { useEffect, useState } from 'react';
import { Video, Save, ExternalLink } from 'lucide-react';
type Item={team:string;url:string;description:string};
const teams=['Equipo Uno','Equipo Dos','Equipo Tres','Equipo Cuatro','Equipo Cinco'];
const KEY='leaf-emerging-tech-v1';
export function EmergingTechSection(){
 const [items,setItems]=useState<Item[]>(()=>{try{const saved=localStorage.getItem(KEY);if(saved)return JSON.parse(saved)}catch{}return teams.map(team=>({team,url:'',description:''}))});
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch{}},[items]);
 return <section id="tecnologias-emergentes" className="mt-16 border-t border-stone-200 pt-10">
  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800"><Video size={15}/> Tecnologías emergentes</p>
  <h2 className="mt-2 font-serif text-3xl">Videos y recursos por equipo</h2>
  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">Integra aquí los videos, demostraciones y recursos relacionados con Tecnologías y Pedagogías Emergentes. Usa un enlace público de video o archivo.</p>
  <div className="mt-6 grid gap-4 md:grid-cols-2">{items.map((item,i)=><div key={item.team} className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="font-serif text-xl">{teams[i]}</h3><label className="mt-4 block text-xs font-semibold text-stone-600">Enlace del video o recurso<input type="url" value={item.url} onChange={e=>setItems(p=>p.map((x,j)=>i===j?{...x,url:e.target.value}:x))} placeholder="https://..." className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 font-normal"/></label><label className="mt-3 block text-xs font-semibold text-stone-600">Descripción (opcional)<textarea value={item.description} onChange={e=>setItems(p=>p.map((x,j)=>i===j?{...x,description:e.target.value}:x))} placeholder="Breve descripción..." className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 font-normal"/></label><div className="mt-3 flex items-center justify-between"><span className="text-xs text-stone-400">Se guarda en este navegador</span>{item.url&&<a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-amber-800 underline">Abrir <ExternalLink size={13}/></a>}</div></div>)}</div>
  <p className="mt-3 text-xs text-stone-400">Para que los enlaces que agregues aparezcan para todas las personas, será necesario incorporarlos al repositorio y volver a publicar el sitio.</p>
 </section>
}
