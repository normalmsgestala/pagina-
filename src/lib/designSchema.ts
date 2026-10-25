// Diseño editable de la página (lo usan el servidor y la página). Sin dependencias de React.

export type SectionId = 'semestres' | 'calendario' | 'biblioteca';
export type Radius = 'recto' | 'normal' | 'redondo';

export interface SiteDesign {
  colors: {
    accent: string;      // color principal (títulos pequeños, enlaces, botones de acento)
    dark: string;        // botones oscuros y texto principal
    background: string;  // fondo de la página
    marquee: string;     // fondo de la marquesina del proyecto (Bienvenidos al Parque)
    gold: string;        // franjas y detalles dorados
  };
  fonts: { heading: string; body: string };
  radius: Radius;
  home: {
    logo: string;        // nombre en la barra superior
    badge: string;       // línea pequeña sobre el título
    title: string;
    description: string;
    sections: { id: SectionId; visible: boolean }[];
  };
}

export const SECTION_LABEL: Record<SectionId, string> = {
  semestres: 'Organización por semestres',
  calendario: 'Calendario de actividades',
  biblioteca: 'Biblioteca del grupo (documentos, fuentes y evidencias)',
};

export const HEADING_FONTS = ['Fraunces', 'Playfair Display', 'Merriweather', 'Lora', 'Roboto Slab', 'Bitter', 'Montserrat', 'Poppins', 'Baloo 2'];
export const BODY_FONTS = ['Plus Jakarta Sans', 'Inter', 'Nunito', 'Lato', 'Source Sans 3', 'Poppins', 'Montserrat', 'Merriweather'];

export const DEFAULT_DESIGN: SiteDesign = {
  colors: { accent: '#92400e', dark: '#1c1917', background: '#fff8e8', marquee: '#8e1d2c', gold: '#f2bd45' },
  fonts: { heading: 'Fraunces', body: 'Plus Jakarta Sans' },
  radius: 'normal',
  home: {
    logo: 'Campus LEAF',
    badge: 'Generación 2026–2030 · Escuela Normal Superior «Profesor Moisés Sáenz Garza»',
    title: 'Campus LEAF: la física se vuelve una aventura',
    description: 'Diseñar y construir un entorno interactivo y lúdico basado en atracciones mecánicas y astronómicas, transformando conceptos abstractos de la física en experiencias de aprendizaje activo para la formación docente en la Escuela Normal Superior. La articulación de mecánica, álgebra, tecnologías y didáctica garantiza el desarrollo de competencias pedagógicas innovadoras para la enseñanza en educación básica.',
    sections: [{ id: 'semestres', visible: true }, { id: 'calendario', visible: true }, { id: 'biblioteca', visible: true }],
  },
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const text = (v: unknown, max: number, def: string) => (typeof v === 'string' ? v.trim().slice(0, max) : def);

/** Limpia cualquier diseño recibido: solo colores hexadecimales, tipografías de la lista y textos acotados. */
export function sanitizeDesign(input: unknown): SiteDesign {
  const d = (input && typeof input === 'object' ? input : {}) as any;
  const c = d.colors || {}, f = d.fonts || {}, h = d.home || {};
  const color = (k: keyof SiteDesign['colors']) => (typeof c[k] === 'string' && HEX.test(c[k]) ? c[k].toLowerCase() : DEFAULT_DESIGN.colors[k]);
  const ids = Object.keys(SECTION_LABEL) as SectionId[];
  const given: { id: SectionId; visible: boolean }[] = Array.isArray(h.sections)
    ? h.sections.filter((x: any) => x && ids.includes(x.id)).map((x: any) => ({ id: x.id, visible: x.visible !== false }))
    : [];
  const seen = new Set<string>();
  const sections = [...given, ...DEFAULT_DESIGN.home.sections].filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  return {
    colors: { accent: color('accent'), dark: color('dark'), background: color('background'), marquee: color('marquee'), gold: color('gold') },
    fonts: {
      heading: HEADING_FONTS.includes(f.heading) ? f.heading : DEFAULT_DESIGN.fonts.heading,
      body: BODY_FONTS.includes(f.body) ? f.body : DEFAULT_DESIGN.fonts.body,
    },
    radius: (['recto', 'normal', 'redondo'] as Radius[]).includes(d.radius) ? d.radius : 'normal',
    home: {
      logo: text(h.logo, 40, DEFAULT_DESIGN.home.logo) || DEFAULT_DESIGN.home.logo,
      badge: text(h.badge, 160, DEFAULT_DESIGN.home.badge),
      title: text(h.title, 160, DEFAULT_DESIGN.home.title) || DEFAULT_DESIGN.home.title,
      description: text(h.description, 1500, DEFAULT_DESIGN.home.description),
      sections,
    },
  };
}

/** Variables CSS que reemplazan los colores, tipografías y esquinas de Tailwind en toda la página. */
export function designVariables(d: SiteDesign): Record<string, string> {
  const a = d.colors.accent, k = d.colors.dark;
  const mixW = (c: string, p: number) => `color-mix(in oklab, ${c} ${p}%, white)`;
  const mixB = (c: string, p: number) => `color-mix(in oklab, ${c} ${p}%, black)`;
  const radius = d.radius === 'recto'
    ? { lg: '0.2rem', xl: '0.25rem', '2xl': '0.3rem', '3xl': '0.4rem' }
    : d.radius === 'redondo' ? { lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' }
      : { lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem' };
  const font = (name: string, fallback: string) => `'${name}', ${fallback}`;
  return {
    '--color-amber-50': mixW(a, 8), '--color-amber-100': mixW(a, 16), '--color-amber-200': mixW(a, 30), '--color-amber-300': mixW(a, 48),
    '--color-amber-600': mixW(a, 80), '--color-amber-700': mixW(a, 90), '--color-amber-800': a, '--color-amber-900': mixB(a, 78),
    '--color-stone-900': k, '--color-stone-800': mixW(k, 88), '--color-stone-950': mixB(k, 80),
    '--color-stone-50': d.colors.background, '--circus-cream': d.colors.background,
    '--circus-red': d.colors.marquee, '--circus-gold': d.colors.gold,
    '--font-serif': font(d.fonts.heading, 'Georgia, serif'), '--leaf-font-heading': font(d.fonts.heading, 'Georgia, serif'),
    '--font-sans': font(d.fonts.body, 'system-ui, sans-serif'), '--leaf-font-body': font(d.fonts.body, 'system-ui, sans-serif'),
    '--radius-lg': radius.lg, '--radius-xl': radius.xl, '--radius-2xl': radius['2xl'], '--radius-3xl': radius['3xl'],
  };
}
