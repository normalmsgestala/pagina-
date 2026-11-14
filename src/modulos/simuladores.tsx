// Simuladores del Módulo 1 "Explorando el Universo".
// Son experiencias visuales que se manipulan: sin gráficas ni tablas.
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = { onUse: () => void };

export interface InfoSimulador {
  id: string;
  titulo: string;
  instruccion: string;
  reflexion: string[];
  Componente: React.FC<Props>;
}

// Generador pseudoaleatorio estable
const rng = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function useUsoUnaVez(onUse: () => void) {
  const hecho = useRef(false);
  return () => { if (!hecho.current) { hecho.current = true; onUse(); } };
}

const Boton: React.FC<{ activo?: boolean; onClick: () => void; children: React.ReactNode }> = ({ activo, onClick, children }) => (
  <button type="button" onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${activo ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-stone-700 border-stone-300 hover:border-amber-600'}`}>
    {children}
  </button>
);

const Mensaje: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm sm:text-base text-stone-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{children}</p>
);

// ---------------------------------------------------------------- 1
const ESTRELLAS = (() => { const r = rng(7); return Array.from({ length: 420 }, () => ({ x: r() * 400, y: r() * 260, b: r() ** 3 })); })();
const CRATERES = (() => { const r = rng(21); return Array.from({ length: 16 }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 34; return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 2 + r() * 6 }; }); })();

const OjoVsTelescopio: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const niveles = [
    { nombre: 'Mi ojo (pupila de 7 mm)', limite: 0.82, nitidez: 0, texto: 'Con tu pupila, que es como un frijol, solo juntas la luz de las estrellas más brillantes. La Luna se ve como una mancha.' },
    { nombre: 'Lupa de 5 cm', limite: 0.35, nitidez: 0.55, texto: 'Una lupa de 5 cm junta unas 50 veces más luz que tu ojo. ¡Aparecen muchas estrellas nuevas y se notan algunos cráteres!' },
    { nombre: 'Telescopio grande', limite: 0, nitidez: 1, texto: 'Una abertura grande junta muchísima luz: el cielo se llena de estrellas y los cráteres de la Luna se ven claritos.' },
  ];
  const [n, setN] = useState(0);
  const nv = niveles[n];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 260" className="w-full rounded-xl bg-[#060b1f]">
        {ESTRELLAS.filter((s) => s.b >= nv.limite).map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={0.6 + s.b * 1.6} fill="#fff" opacity={0.5 + s.b / 2} />
        ))}
        <g transform="translate(320 70)">
          <circle r="42" fill="#d9d4c7" style={{ filter: `blur(${(1 - nv.nitidez) * 5}px)` }} />
          {CRATERES.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#9a9384" opacity={nv.nitidez * 0.9} />)}
        </g>
        <circle cx={60} cy={210} r={6 + n * 14} fill="none" stroke="#f2bd45" strokeWidth="2" />
        <text x={60} y={250} fill="#f2bd45" fontSize="11" textAnchor="middle">abertura</text>
      </svg>
      <label className="block text-sm font-semibold text-stone-700">Tamaño de la abertura que junta la luz</label>
      <input type="range" min={0} max={2} step={1} value={n} onChange={(e) => { setN(+e.target.value); usar(); }} className="w-full accent-amber-700" />
      <div className="flex justify-between text-xs text-stone-600"><span>Ojo</span><span>Lupa</span><span>Telescopio</span></div>
      <Mensaje><b>{nv.nombre}.</b> {nv.texto}</Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 2
const LuzQueNoVes: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const modos = {
    ojo: { nombre: 'Mis ojos (luz visible)', fondo: '#070b1c', texto: 'Ves estrellas y un poco de brillo, pero el polvo oscuro tapa lo que hay detrás. Tus ojos solo detectan la luz visible.', aparato: 'Ojo o telescopio óptico' },
    infra: { nombre: 'Cámara infrarroja', fondo: '#1c0805', texto: 'Con luz infrarroja el polvo ya no estorba: aparecen estrellas que estaban escondidas. Así trabaja el telescopio James Webb.', aparato: 'Telescopio James Webb' },
    radio: { nombre: 'Radiotelescopio', fondo: '#04121a', texto: 'Con ondas de radio se ven chorros enormes que salen del centro de la galaxia. Tus ojos nunca los podrían ver.', aparato: 'Radiotelescopio' },
    rx: { nombre: 'Telescopio de rayos X', fondo: '#0d0618', texto: 'Los rayos X muestran las zonas más calientes: el centro de la galaxia brilla con mucha fuerza.', aparato: 'Telescopio de rayos X (en el espacio)' },
  } as const;
  type K = keyof typeof modos;
  const [m, setM] = useState<K>('ojo');
  const [control, setControl] = useState<'ojo' | 'camara'>('ojo');
  const r = useMemo(() => rng(5), []);
  const puntos = useMemo(() => Array.from({ length: 160 }, () => { const a = r() * Math.PI * 2, d = r() ** 0.7 * 120; return { x: 200 + Math.cos(a) * d, y: 130 + Math.sin(a) * d * 0.45, oculta: Math.abs(Math.sin(a) * d * 0.45) < 14 && d > 25 }; }), [r]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(modos) as K[]).map((k) => <Boton key={k} activo={m === k} onClick={() => { setM(k); usar(); }}>{modos[k].nombre}</Boton>)}
      </div>
      <svg viewBox="0 0 400 260" className="w-full rounded-xl" style={{ background: modos[m].fondo }}>
        <defs>
          <radialGradient id="g-centro"><stop offset="0" stopColor={m === 'rx' ? '#e9d5ff' : m === 'infra' ? '#fdba74' : '#fff7d6'} /><stop offset="1" stopColor="transparent" /></radialGradient>
        </defs>
        {m !== 'radio' && <ellipse cx="200" cy="130" rx={m === 'rx' ? 30 : 60} ry={m === 'rx' ? 18 : 26} fill="url(#g-centro)" opacity={m === 'rx' ? 1 : 0.8} />}
        {(m === 'ojo' || m === 'infra') && puntos.filter((p) => m === 'infra' || !p.oculta).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.3} fill={m === 'infra' ? (p.oculta ? '#fde68a' : '#fb923c') : '#fff'} />
        ))}
        {m === 'ojo' && <ellipse cx="200" cy="130" rx="130" ry="9" fill="#05070f" opacity="0.9" />}
        {m === 'radio' && (
          <g>
            <circle cx="200" cy="130" r="6" fill="#67e8f9" />
            <path d="M200 130 C 240 100, 290 80, 340 60" stroke="#22d3ee" strokeWidth="6" fill="none" opacity="0.7" />
            <path d="M200 130 C 160 160, 110 180, 60 200" stroke="#22d3ee" strokeWidth="6" fill="none" opacity="0.7" />
            <circle cx="345" cy="58" r="26" fill="#0891b2" opacity="0.6" /><circle cx="55" cy="202" r="26" fill="#0891b2" opacity="0.6" />
          </g>
        )}
        {m === 'rx' && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={130 + i * 35} cy={110 + (i % 2) * 40} r={3} fill="#c4b5fd" />)}
      </svg>
      <Mensaje><b>{modos[m].nombre}:</b> {modos[m].texto} <span className="block mt-1 text-amber-900">Aparato: {modos[m].aparato}.</span></Mensaje>
      <div className="rounded-xl border border-stone-200 p-3 space-y-2 bg-white">
        <div className="text-sm font-semibold text-stone-700">Recuerda el experimento del control remoto</div>
        <div className="flex gap-2"><Boton activo={control === 'ojo'} onClick={() => { setControl('ojo'); usar(); }}>Lo miro con mis ojos</Boton><Boton activo={control === 'camara'} onClick={() => { setControl('camara'); usar(); }}>Lo miro con la cámara</Boton></div>
        <svg viewBox="0 0 200 70" className="w-48">
          <rect x="20" y="15" width="150" height="40" rx="12" fill="#292524" />
          <circle cx="170" cy="35" r="5" fill={control === 'camara' ? '#e9d5ff' : '#57534e'} />
          {control === 'camara' && <circle cx="170" cy="35" r="14" fill="#c084fc" opacity="0.45" />}
        </svg>
        <p className="text-sm text-stone-700">{control === 'ojo' ? 'No ves nada: el control manda luz infrarroja.' : 'La cámara sí detecta la luz infrarroja del control.'}</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 3
const ZONAS = [
  { n: 'Radio', c: '#0e7490' }, { n: 'Microondas', c: '#0f766e' }, { n: 'Infrarrojo', c: '#b91c1c' },
  { n: 'Visible', c: 'url(#arcoiris)' }, { n: 'Ultravioleta', c: '#7e22ce' }, { n: 'Rayos X', c: '#4338ca' }, { n: 'Rayos gamma', c: '#1e1b4b' },
];
const QUIEN = ['Radiotelescopio', 'Radiotelescopio', 'Telescopio James Webb', 'Tus ojos y los telescopios ópticos', 'Telescopios en el espacio', 'Telescopios de rayos X en el espacio', 'Telescopios de rayos gamma en el espacio'];

const CuerdaDeOndas: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [v, setV] = useState(0);
  const [t, setT] = useState(0);
  useEffect(() => { let id = 0; const loop = () => { setT((x) => x + 1); id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); return () => cancelAnimationFrame(id); }, []);
  const zona = Math.min(6, Math.floor(v / (100 / 7)));
  const largo = 260 - v * 2.4; // longitud de onda en px
  const pts = Array.from({ length: 201 }, (_, i) => { const x = i * 2; return `${x},${70 + Math.sin(((x - t * (1 + v / 30)) / largo) * Math.PI * 2) * 40}`; }).join(' ');
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 140" className="w-full rounded-xl bg-white border border-stone-200">
        <circle cx="4" cy="70" r="6" fill="#92400e" />
        <polyline points={pts} fill="none" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <label className="block text-sm font-semibold text-stone-700">Rapidez con la que agitas la cuerda</label>
      <input type="range" min={0} max={99} value={v} onChange={(e) => { setV(+e.target.value); usar(); }} className="w-full accent-amber-700" />
      <div className="flex justify-between text-xs text-stone-600"><span>Despacio → ondas largas</span><span>Rápido → ondas cortas</span></div>
      <svg viewBox="0 0 400 46" className="w-full">
        <defs><linearGradient id="arcoiris"><stop offset="0" stopColor="#ef4444" /><stop offset=".25" stopColor="#f59e0b" /><stop offset=".5" stopColor="#22c55e" /><stop offset=".75" stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
        {ZONAS.map((z, i) => (
          <g key={z.n} opacity={i === zona ? 1 : 0.35}>
            <rect x={i * 57 + 1} y={2} width={55} height={24} rx={5} fill={z.c} stroke={i === zona ? '#f59e0b' : 'none'} strokeWidth={3} />
            <text x={i * 57 + 28.5} y={40} textAnchor="middle" fontSize="9" fill="#44403c" fontWeight={i === zona ? 700 : 400}>{z.n}</text>
          </g>
        ))}
      </svg>
      <Mensaje>Tu onda está en la zona de <b>{ZONAS[zona].n}</b>. {zona === 3 ? '¡Esta sí la ven tus ojos!' : 'Tus ojos no la pueden ver.'} La detecta: <b>{QUIEN[zona]}</b>.</Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 4
const LupasRefraccion: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [f, setF] = useState(20); // distancia focal en cm
  const [d, setD] = useState(10); // distancia lupa-hoja en cm
  const escala = 8; // px por cm
  const hojaX = 380; const lupaX = hojaX - d * escala; const focoX = lupaX + f * escala;
  const error = Math.abs(d - f);
  const enfocado = error < 0.75;
  const ys = [-30, -15, 0, 15, 30];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Boton activo={f === 20} onClick={() => { setF(20); usar(); }}>Lupa grande</Boton>
        <Boton activo={f === 5} onClick={() => { setF(5); usar(); }}>Lupa chica</Boton>
      </div>
      <svg viewBox="0 0 420 200" className="w-full rounded-xl bg-white border border-stone-200">
        <rect x="6" y="40" width="34" height="120" fill="#bae6fd" stroke="#0369a1" strokeWidth="3" />
        <line x1="23" y1="40" x2="23" y2="160" stroke="#0369a1" strokeWidth="2" /><line x1="6" y1="100" x2="40" y2="100" stroke="#0369a1" strokeWidth="2" />
        <text x="23" y="178" fontSize="10" textAnchor="middle" fill="#44403c">ventana</text>
        {ys.map((y, i) => {
          const yRay = 100 + y; const yHoja = 100 + y * (1 - d / f);
          return <g key={i}>
            <line x1="40" y1={yRay} x2={lupaX} y2={yRay} stroke="#f59e0b" strokeWidth="1.5" />
            <line x1={lupaX} y1={yRay} x2={hojaX} y2={yHoja} stroke="#f59e0b" strokeWidth="1.5" />
          </g>;
        })}
        <ellipse cx={lupaX} cy="100" rx="7" ry="48" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" opacity="0.9" />
        {focoX < hojaX + 30 && <circle cx={focoX} cy="100" r="3" fill="#dc2626" />}
        <rect x={hojaX} y="30" width="8" height="140" fill="#fafaf9" stroke="#78716c" />
        <g transform={`translate(${hojaX + 14} 100)`} style={{ filter: `blur(${Math.min(6, error * 0.9)}px)` }}>
          <rect x="0" y="-22" width="18" height="44" fill="#bae6fd" stroke="#0369a1" strokeWidth="2" transform="scale(1,-1)" />
          <line x1="0" y1="0" x2="18" y2="0" stroke="#0369a1" strokeWidth="2" />
        </g>
        <text x={(lupaX + hojaX) / 2} y="192" fontSize="11" textAnchor="middle" fill="#44403c">{d.toFixed(1)} cm</text>
      </svg>
      <label className="block text-sm font-semibold text-stone-700">Mueve la lupa (distancia a la hoja)</label>
      <input type="range" min={2} max={30} step={0.5} value={d} onChange={(e) => { setD(+e.target.value); usar(); }} className="w-full accent-amber-700" />
      <Mensaje>
        {enfocado
          ? <>¡Enfocado! La imagen de la ventana se ve clara y <b>al revés</b>. La distancia focal de esta lupa es <b>{f} cm</b>. La luz se dobló al pasar por el vidrio: eso es la refracción.</>
          : <>La imagen se ve borrosa. {d < f ? 'Aleja' : 'Acerca'} la lupa de la hoja. Fíjate cómo la lupa dobla los rayos de luz y los junta en un punto rojo.</>}
      </Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 5
const ArmaTelescopio: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [grande, setGrande] = useState(20);
  const [chica, setChica] = useState(5);
  const [largo, setLargo] = useState(18);
  const [obj, setObj] = useState<'luna' | 'letrero'>('luna');
  const aumento = Math.round((grande / chica) * 10) / 10;
  const ideal = grande + chica;
  const error = Math.abs(largo - ideal);
  const ok = error < 1;
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-stone-700">Lupa grande (adelante)</div>
          <div className="flex gap-2 flex-wrap">{[15, 20, 30].map((v) => <Boton key={v} activo={grande === v} onClick={() => { setGrande(v); usar(); }}>{v} cm</Boton>)}</div>
          <div className="text-sm font-semibold text-stone-700">Lupa chica (junto al ojo)</div>
          <div className="flex gap-2 flex-wrap">{[3, 5, 6].map((v) => <Boton key={v} activo={chica === v} onClick={() => { setChica(v); usar(); }}>{v} cm</Boton>)}</div>
          <div className="text-sm font-semibold text-stone-700">¿Qué quieres ver?</div>
          <div className="flex gap-2"><Boton activo={obj === 'luna'} onClick={() => setObj('luna')}>La Luna</Boton><Boton activo={obj === 'letrero'} onClick={() => setObj('letrero')}>Un letrero lejano</Boton></div>
        </div>
        <svg viewBox="-60 -60 120 120" className="w-full max-w-[260px] mx-auto rounded-full bg-[#060b1f] border-4 border-stone-800">
          <g style={{ filter: `blur(${Math.min(5, error * 0.7)}px)` }} transform={`rotate(180) scale(${0.35 + aumento * 0.13})`}>
            {obj === 'luna'
              ? <g><circle r="34" fill="#d9d4c7" />{CRATERES.map((c, i) => <circle key={i} cx={c.x * 0.9} cy={c.y * 0.9} r={c.r * 0.8} fill="#9a9384" />)}</g>
              : <g><rect x="-34" y="-14" width="68" height="28" fill="#15803d" rx="3" /><text y="5" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">ALTO 20</text></g>}
          </g>
        </svg>
      </div>
      <label className="block text-sm font-semibold text-stone-700">Largo del tubo: {largo} cm</label>
      <input type="range" min={5} max={40} step={1} value={largo} onChange={(e) => { setLargo(+e.target.value); usar(); }} className="w-full accent-amber-700" />
      <svg viewBox="0 0 400 50" className="w-full">
        <rect x="20" y="12" width={Math.min(360, largo * 9)} height="26" rx="4" fill="#a16207" />
        <ellipse cx="20" cy="25" rx="5" ry="20" fill="#bae6fd" stroke="#0284c7" />
        <ellipse cx={20 + Math.min(360, largo * 9)} cy="25" rx="3" ry="10" fill="#bae6fd" stroke="#0284c7" />
      </svg>
      <Mensaje>
        Tu telescopio acerca <b>{aumento} veces</b> ({grande} ÷ {chica}). {ok
          ? <>¡Quedó <b>enfocado</b>! El largo ideal es {grande} + {chica} = {ideal} cm. La imagen se ve al revés: es normal, la luz se dobla.</>
          : <>Está <b>borroso</b>. {largo < ideal ? 'Alarga' : 'Acorta'} el tubo. Pista: suma las dos distancias focales.</>}
      </Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 6
const VIAJE = [
  { n: 'La Luna', t: '1 segundo', p: 'Ves la Luna como era hace un segundo.', c: '#d6d3d1', r: 16 },
  { n: 'El Sol', t: '8 minutos', p: 'Ves el Sol como era hace 8 minutos. (¡Nunca lo mires directo!)', c: '#fbbf24', r: 26 },
  { n: 'Júpiter', t: 'unos 40 minutos', p: 'Ves Júpiter como era hace casi una clase entera.', c: '#d97706', r: 18 },
  { n: 'Próxima Centauri', t: 'unos 4 años', p: 'Es la estrella más cercana después del Sol. Su luz salió cuando ibas en primaria.', c: '#f87171', r: 9 },
  { n: 'Sirio', t: 'unos 9 años', p: 'La estrella más brillante de la noche. Su luz salió cuando eras muy pequeño.', c: '#e0f2fe', r: 11 },
  { n: 'Centro de nuestra galaxia', t: 'unos 26,000 años', p: 'Esa luz salió cuando todavía no existían las ciudades.', c: '#fde68a', r: 22 },
  { n: 'Galaxia de Andrómeda', t: 'unos 2.5 millones de años', p: 'Su luz salió antes de que existieran los seres humanos como nosotros.', c: '#c7d2fe', r: 24 },
  { n: 'Galaxias muy lejanas', t: 'más de 13,000 millones de años', p: 'Telescopios como el James Webb detectan luz que salió cuando el Universo era muy joven.', c: '#fca5a5', r: 14 },
];
const MirarElPasado: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [i, setI] = useState(0);
  const o = VIAJE[i];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 160" className="w-full rounded-xl bg-[#060b1f]">
        {ESTRELLAS.slice(0, 120).map((s, k) => <circle key={k} cx={s.x} cy={s.y * 0.6} r={0.7} fill="#fff" opacity={0.4} />)}
        <circle cx="30" cy="80" r="12" fill="#3b82f6" /><text x="30" y="110" fill="#bfdbfe" fontSize="10" textAnchor="middle">Tierra</text>
        <circle cx="340" cy="80" r={o.r} fill={o.c} />
        <line x1="45" y1="80" x2={340 - o.r - 4} y2="80" stroke="#fde68a" strokeWidth="2" strokeDasharray="6 6">
          <animate attributeName="stroke-dashoffset" from="0" to="24" dur="0.6s" repeatCount="indefinite" />
        </line>
        <text x="340" y={80 + o.r + 18} fill="#fff" fontSize="11" textAnchor="middle">{o.n}</text>
      </svg>
      <input type="range" min={0} max={VIAJE.length - 1} value={i} onChange={(e) => { setI(+e.target.value); usar(); }} className="w-full accent-amber-700" />
      <div className="flex justify-between text-xs text-stone-600"><span>Cerca</span><span>Muy, muy lejos</span></div>
      <Mensaje>La luz de <b>{o.n}</b> tarda <b>{o.t}</b> en llegar a tus ojos. {o.p}</Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 7
const ESCENAS = [
  { t: 'Hace unos 13,800 millones de años', d: 'El Universo nació muy pequeño y muy caliente.' },
  { t: 'Se estira y se enfría', d: 'El Universo se hizo más grande y se fue enfriando. Todavía no había estrellas.' },
  { t: 'Las primeras estrellas', d: 'El gas se juntó por la gravedad y se encendieron las primeras estrellas.' },
  { t: 'Se forman las galaxias', d: 'Las estrellas se agruparon en galaxias, como nuestra Vía Láctea.' },
  { t: 'Nacen el Sol y la Tierra', d: 'Mucho después, hace unos 4,600 millones de años, se formaron el Sol y la Tierra.' },
  { t: 'Hoy', d: 'El Universo sigue creciendo, y cada vez más rápido. Lo sabemos por la luz que detectan los telescopios.' },
];
const HistoriaUniverso: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [i, setI] = useState(0);
  const r = useMemo(() => rng(11), []);
  const pts = useMemo(() => Array.from({ length: 70 }, () => ({ a: r() * Math.PI * 2, d: r() })), [r]);
  const radio = [10, 45, 70, 90, 95, 112][i];
  const fondo = ['#7c2d12', '#3b0764', '#0f172a', '#0b1023', '#0b1023', '#050816'][i];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 220" className="w-full rounded-xl transition-colors" style={{ background: fondo }}>
        <circle cx="200" cy="110" r={radio} fill={i === 0 ? '#fde047' : 'none'} stroke={i > 0 ? '#a5b4fc' : 'none'} strokeDasharray="4 6" opacity={i === 0 ? 1 : 0.5} />
        {i === 0 && <circle cx="200" cy="110" r="22" fill="#fb923c" opacity="0.5" />}
        {i === 1 && pts.map((p, k) => <circle key={k} cx={200 + Math.cos(p.a) * p.d * radio} cy={110 + Math.sin(p.a) * p.d * radio} r="1.5" fill="#c4b5fd" opacity="0.5" />)}
        {i >= 2 && pts.slice(0, i === 2 ? 15 : 70).map((p, k) => <circle key={k} cx={200 + Math.cos(p.a) * p.d * radio} cy={110 + Math.sin(p.a) * p.d * radio * 0.9} r={i === 2 ? 2.5 : 1.3} fill="#fff" />)}
        {i >= 3 && [[-50, -30], [45, 25], [-20, 50], [60, -45]].map(([x, y], k) => (
          <ellipse key={k} cx={200 + x} cy={110 + y} rx="16" ry="6" fill="#e0e7ff" opacity="0.6" transform={`rotate(${k * 40} ${200 + x} ${110 + y})`} />
        ))}
        {i >= 4 && <g><circle cx="250" cy="150" r="7" fill="#fbbf24" /><circle cx="264" cy="150" r="3" fill="#3b82f6" /></g>}
        {i === 5 && [0, 1, 2, 3].map((k) => <path key={k} d={`M${200 + Math.cos(k * 1.57 + 0.78) * 125} ${110 + Math.sin(k * 1.57 + 0.78) * 95} l${Math.cos(k * 1.57 + 0.78) * 18} ${Math.sin(k * 1.57 + 0.78) * 14}`} stroke="#fde68a" strokeWidth="3" markerEnd="" />)}
      </svg>
      <div className="flex items-center justify-between gap-2">
        <Boton onClick={() => { setI(Math.max(0, i - 1)); usar(); }}>← Antes</Boton>
        <span className="text-xs text-stone-600">Escena {i + 1} de {ESCENAS.length}</span>
        <Boton activo onClick={() => { setI(Math.min(ESCENAS.length - 1, i + 1)); usar(); }}>Después →</Boton>
      </div>
      <Mensaje><b>{ESCENAS[i].t}.</b> {ESCENAS[i].d}</Mensaje>
    </div>
  );
};

// ---------------------------------------------------------------- 8
const CANICAS = (() => { const r = rng(3); const tipos = [...Array(5).fill('v'), ...Array(27).fill('mo'), ...Array(68).fill('eo')] as ('v' | 'mo' | 'eo')[]; for (let i = tipos.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [tipos[i], tipos[j]] = [tipos[j], tipos[i]]; } return tipos; })();
const LoQueNoSeVe: React.FC<Props> = ({ onUse }) => {
  const usar = useUsoUnaVez(onUse);
  const [grav, setGrav] = useState(false);
  const [exp, setExp] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Boton activo={grav} onClick={() => { setGrav(!grav); usar(); }}>Activar gravedad</Boton>
        <Boton activo={exp} onClick={() => { setExp(!exp); usar(); }}>Activar expansión</Boton>
      </div>
      <svg viewBox="0 0 300 300" className="w-full max-w-sm mx-auto rounded-xl bg-[#0b0a14]">
        {CANICAS.map((t, k) => {
          const x = 18 + (k % 10) * 29.5, y = 18 + Math.floor(k / 10) * 29.5;
          if (t === 'v') return <g key={k}><circle cx={x} cy={y} r="11" fill="#fde68a" /><circle cx={x} cy={y} r="15" fill="#fde68a" opacity="0.25" /></g>;
          if (t === 'mo') return <circle key={k} cx={x} cy={y} r="11" fill={grav ? '#7c3aed' : '#16131f'} stroke={grav ? '#c4b5fd' : '#1f1b2b'} strokeWidth="2" />;
          return <circle key={k} cx={x} cy={y} r="11" fill={exp ? '#0e7490' : '#16131f'} stroke={exp ? '#67e8f9' : '#1f1b2b'} strokeWidth="2" strokeDasharray={exp ? '3 3' : ''} />;
        })}
      </svg>
      <Mensaje>
        Imagina que el Universo es una caja con 100 canicas. Solo <b>5 brillan</b>: estrellas, planetas, polvo y nosotros.
        {grav && <> Al activar la gravedad aparecen <b>27 canicas moradas</b>: la materia oscura. No da luz, pero hace que las galaxias giren más rápido.</>}
        {exp && <> Al activar la expansión aparecen <b>68 canicas azules</b>: la energía oscura, que hace que el Universo crezca cada vez más rápido.</>}
        {!grav && !exp && <> ¿Y las demás? Activa los botones para descubrirlas.</>}
      </Mensaje>
    </div>
  );
};

// ----------------------------------------------------------------
export const SIMULADORES: Record<string, InfoSimulador> = {
  'ojo-vs-telescopio': { id: 'ojo-vs-telescopio', titulo: 'Ojo vs. telescopio', instruccion: 'Mueve la barra para cambiar el tamaño de la abertura que junta la luz. Observa las estrellas y la Luna.', reflexion: ['¿Qué cambió en el cielo cuando la abertura fue más grande?', '¿Por qué tu ojo solo ve las estrellas más brillantes?'], Componente: OjoVsTelescopio },
  'luz-que-no-ves': { id: 'luz-que-no-ves', titulo: 'La luz que no ves', instruccion: 'Elige con qué "anteojos" quieres mirar la misma galaxia.', reflexion: ['¿Qué aparato te dejó ver más cosas escondidas?', '¿Por qué los científicos usan varios telescopios para un mismo objeto?'], Componente: LuzQueNoVes },
  'cuerda-de-ondas': { id: 'cuerda-de-ondas', titulo: 'La cuerda de ondas', instruccion: 'Mueve la barra para agitar la cuerda despacio o rápido. Fíjate en qué zona cae tu onda.', reflexion: ['¿Qué pasa con las ondas cuando agitas más rápido?', '¿En qué zona está la única luz que ven tus ojos?'], Componente: CuerdaDeOndas },
  'lupas-refraccion': { id: 'lupas-refraccion', titulo: 'Lupas y refracción', instruccion: 'Elige una lupa y muévela hasta que la imagen de la ventana se vea clara en la hoja.', reflexion: ['¿A qué distancia enfocó cada lupa?', '¿Por qué la imagen se ve al revés?'], Componente: LupasRefraccion },
  'arma-telescopio': { id: 'arma-telescopio', titulo: 'Arma tu telescopio', instruccion: 'Escoge tus dos lupas y ajusta el largo del tubo hasta que la imagen quede enfocada.', reflexion: ['¿Qué combinación de lupas acerca más?', '¿Cómo sabes qué largo debe tener tu tubo?'], Componente: ArmaTelescopio },
  'mirar-el-pasado': { id: 'mirar-el-pasado', titulo: 'Mirar lejos es mirar el pasado', instruccion: 'Mueve la barra para viajar desde la Luna hasta las galaxias más lejanas.', reflexion: ['¿Por qué al mirar una estrella vemos el pasado?'], Componente: MirarElPasado },
  'historia-universo': { id: 'historia-universo', titulo: 'La historia del Universo', instruccion: 'Avanza escena por escena para recorrer la historia del Universo.', reflexion: ['¿Cómo era el Universo al principio y cómo es hoy?'], Componente: HistoriaUniverso },
  'lo-que-no-se-ve': { id: 'lo-que-no-se-ve', titulo: 'Lo que no se ve del Universo', instruccion: 'Activa la gravedad y la expansión para descubrir lo que no brilla.', reflexion: ['¿Cuántas de las 100 canicas podemos ver?', '¿Cómo saben los científicos que existe lo que no se ve?'], Componente: LoQueNoSeVe },
};
