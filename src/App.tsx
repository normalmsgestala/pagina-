import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, BookOpen, CalendarDays, Menu, Search, X } from 'lucide-react';

type Article = { id: number; category: string; date: string; title: string; excerpt: string; author: string; read: string; image: string; featured?: boolean; };
const articles: Article[] = [
  { id: 1, category: 'Comunidad', date: 'GUÍA PARA LA GENERACIÓN', title: 'Un nuevo capítulo comienza aquí', excerpt: 'Un espacio para compartir ideas, experiencias y todo lo que hace única a nuestra generación 2026–2030.', author: 'Redacción LEAF', read: '4 min', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85', featured: true },
  { id: 2, category: 'Vida estudiantil', date: 'EN LA NORMAL', title: 'Cómo organizarte para aprender mejor', excerpt: 'Ideas sencillas para planear tus semanas, cuidar tu tiempo y aprovechar cada clase sin saturarte.', author: 'Equipo editorial', read: '5 min', image: 'https://images.unsplash.com/photo-1455390582262-044cdae0bbc7?auto=format&fit=crop&w=900&q=80' },
  { id: 3, category: 'Aprendizaje', date: 'RECURSOS', title: 'Aprender física más allá del salón', excerpt: 'Experimentos cotidianos, preguntas curiosas y recursos para mirar el mundo con otros ojos.', author: 'Equipo editorial', read: '6 min', image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=80' },
  { id: 4, category: 'Comunidad', date: 'PARTICIPA', title: 'Las historias que también merecen contarse', excerpt: 'Proyectos, recomendaciones, aprendizajes y voces de estudiantes: este espacio se construye entre todos.', author: 'Redacción LEAF', read: '3 min', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80' },
  { id: 5, category: 'Aprendizaje', date: 'HERRAMIENTAS', title: 'Un método de estudio que sí se adapta a ti', excerpt: 'Prueba distintas técnicas, encuentra la que te funciona y convierte el estudio en un hábito sostenible.', author: 'Equipo editorial', read: '4 min', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80' },
  { id: 6, category: 'Vida estudiantil', date: 'BIENESTAR', title: 'También es importante hacer una pausa', excerpt: 'Descansar, pedir apoyo y mantener el equilibrio forma parte de una experiencia escolar más saludable.', author: 'Equipo editorial', read: '4 min', image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80' },
];
const categories = ['Todo', 'Comunidad', 'Vida estudiantil', 'Aprendizaje'];

export default function App() {
  const [category, setCategory] = useState('Todo');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const filtered = useMemo(() => articles.filter(a => (category === 'Todo' || a.category === category) && (a.title + ' ' + a.excerpt + ' ' + a.category).toLowerCase().includes(search.toLowerCase())), [category, search]);
  const featured = articles[0];
  const rest = filtered.filter(a => a.id !== featured.id);
  const showFeatured = category === 'Todo' && search.length === 0;
  return <div className="site-shell">
    <div className="topline"><span>UN ESPACIO PARA NUESTRA GENERACIÓN</span><span>MONTERREY · 2026—2030</span></div>
    <header className="site-header">
      <a className="brand" href="#inicio" onClick={() => { setCategory('Todo'); setSearch(''); }}><span className="brand-mark">L.</span><span><strong>LEAF<span className="brand-year">2026—2030</span></strong><small>Ideas, historias y comunidad</small></span></a>
      <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'}>
        <a href="#articulos" onClick={() => setMenuOpen(false)}>Artículos</a><a href="#comunidad" onClick={() => setMenuOpen(false)}>Comunidad</a><a href="#acerca" onClick={() => setMenuOpen(false)}>Acerca de</a>
      </nav>
      <a className="header-cta" href="#articulos">Explorar <ArrowDownRight size={16}/></a>
      <button className="mobile-menu" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>
    <main id="inicio">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot"/> REVISTA ESTUDIANTIL · GENERACIÓN 2026—2030</p><h1>Lo que vivimos.<br/><em>Lo que aprendemos.</em><br/>Lo que compartimos.</h1><p className="hero-description">Un lugar para descubrir ideas, contar nuestras experiencias y darle voz a todo lo que construimos como comunidad.</p><a className="primary-link" href="#articulos">Leer las historias <ArrowRight size={17}/></a><div className="hero-note"><span className="note-line"/> HECHO PARA APRENDER JUNTOS</div></div>
        <div className="hero-visual"><img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85" alt="Estudiantes compartiendo una experiencia de aprendizaje"/><div className="image-caption"><span>01 / NUESTRA COMUNIDAD</span><span>Un mismo camino, muchas historias.</span></div><div className="floating-stamp"><BookOpen size={22}/><span>LEE · PIENSA<br/>COMPARTE</span></div></div>
        <div className="hero-index"><span>01</span><span className="index-rule"/><span>03</span></div>
      </section>
      <section className="featured-section" aria-label="Artículo destacado">
        <div className="section-kicker"><span>01 — PARA EMPEZAR</span><span>UNA PUBLICACIÓN DE LEAF</span></div>
        <button className="featured-card" onClick={() => setActiveArticle(featured)}>
          <div className="featured-image"><img src={featured.image} alt="Estudiantes en un espacio de aprendizaje"/><span className="image-tag">DESTACADO</span></div>
          <div className="featured-text"><p className="eyebrow">{featured.category} <span>·</span> {featured.read} de lectura</p><h2>{featured.title}</h2><p>{featured.excerpt}</p><span className="text-link">Descubrir artículo <ArrowRight size={16}/></span><div className="article-meta"><span>POR {featured.author.toUpperCase()}</span><span><CalendarDays size={14}/> EDICIÓN 2026—2030</span></div></div>
        </button>
      </section>
      <section className="articles-section" id="articulos">
        <div className="articles-heading"><div><p className="eyebrow">02 — EL BLOG</p><h2>Ideas para <em>llevar contigo.</em></h2></div><p>Lecturas, recursos y pequeñas ideas para acompañar tu camino como estudiante.</p></div>
        <div className="filter-row"><div className="category-tabs">{categories.map(c => <button key={c} className={category === c ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-box"><Search size={16}/><input aria-label="Buscar artículos" placeholder="Buscar historias..." value={search} onChange={e => setSearch(e.target.value)}/>{search && <button aria-label="Limpiar búsqueda" onClick={() => setSearch('')}><X size={14}/></button>}</label></div>
        {showFeatured && <div className="article-grid">{rest.map((article, i) => <ArticleCard key={article.id} article={article} index={i} onOpen={() => setActiveArticle(article)}/>)}</div>}
        {!showFeatured && <div className="article-grid">{filtered.map((article, i) => <ArticleCard key={article.id} article={article} index={i} onOpen={() => setActiveArticle(article)}/>)}</div>}
        {filtered.length === 0 && <div className="empty-state"><Search size={26}/><h3>No encontramos historias</h3><p>Prueba con otra palabra o elige una categoría diferente.</p><button className="text-link" onClick={() => { setSearch(''); setCategory('Todo'); }}>Ver todos los artículos <ArrowRight size={16}/></button></div>}
      </section>
      <section className="community-band" id="comunidad"><div className="community-number">03 / PARTICIPA</div><div><p className="eyebrow">ESTE ESPACIO TAMBIÉN ES TUYO</p><h2>Las buenas ideas<br/><em>crecen cuando se comparten.</em></h2></div><a href="https://github.com/normalmsgestala/pagina-/issues" target="_blank" rel="noreferrer" className="community-button">Propón una historia <ArrowRight size={17}/></a><span className="community-decoration">L</span></section>
      <section className="about-strip" id="acerca"><span className="about-label">SOBRE LEAF</span><p>LEAF 2026—2030 es un espacio editorial estudiantil para compartir aprendizajes, experiencias y noticias de nuestra comunidad. <strong>Las publicaciones se irán construyendo con las aportaciones de la generación.</strong></p><a href="https://github.com/normalmsgestala/pagina-" target="_blank" rel="noreferrer">Conoce el proyecto <ArrowRight size={15}/></a></section>
    </main>
    <footer className="site-footer"><a className="footer-brand" href="#inicio">LEAF<span>2026—2030</span></a><span>HECHO CON CURIOSIDAD Y EN COMUNIDAD.</span><a href="#inicio">VOLVER ARRIBA ↑</a><small>© 2026 LEAF · Generación 2026—2030</small></footer>
    {activeArticle && <div className="modal-backdrop" role="presentation" onClick={() => setActiveArticle(null)}><article className="article-modal" role="dialog" aria-modal="true" aria-label={activeArticle.title} onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Cerrar artículo" onClick={() => setActiveArticle(null)}><X/></button><img className="modal-image" src={activeArticle.image} alt=""/><div className="modal-content"><p className="eyebrow">{activeArticle.category} · {activeArticle.read} DE LECTURA</p><h2>{activeArticle.title}</h2><p className="modal-byline">POR {activeArticle.author.toUpperCase()} · LEAF 2026—2030</p><p>{activeArticle.excerpt}</p><p>Este espacio está pensado para compartir experiencias, ideas y recursos útiles para nuestra generación. Muy pronto encontrarás aquí nuevas publicaciones y voces de la comunidad.</p><button className="primary-link" onClick={() => setActiveArticle(null)}>Volver al blog <ArrowRight size={16}/></button></div></article></div>}
  </div>;
}
function ArticleCard({ article, index, onOpen }: { article: Article; index: number; onOpen: () => void }) {
  return <button className="article-card" onClick={onOpen}><div className="card-image"><img src={article.image} alt=""/><span className="card-number">0{index + 1}</span><span className="card-arrow"><ArrowDownRight size={18}/></span></div><div className="card-content"><div className="card-meta"><span>{article.category}</span><span>{article.read} de lectura</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><div className="card-footer"><span>{article.author}</span><span>LEER MÁS ↗</span></div></div></button>;
}
