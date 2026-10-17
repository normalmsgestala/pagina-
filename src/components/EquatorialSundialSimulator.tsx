import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sun, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  ExternalLink, 
  Info, 
  Layers, 
  Maximize2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface EquatorialSundialProps {
  appletUrl?: string;
}

export const EquatorialSundialSimulator: React.FC<EquatorialSundialProps> = ({
  appletUrl = 'https://ai.studio/apps/e8b829a0-fea8-4941-9784-6d07e84792c7'
}) => {
  // State for simulator
  const [solarHour, setSolarHour] = useState<number>(12.0); // 6.0 to 18.0
  const [latitude, setLatitude] = useState<number>(25.67); // Monterrey, NL: 25.67°N
  const [dayOfYear, setDayOfYear] = useState<number>(172); // June 21 (Summer Solstice)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFace, setActiveFace] = useState<'auto' | 'north' | 'south' | '3d'>('auto');
  const [showEmbedApplet, setShowEmbedApplet] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Solar declination approximation: delta = 23.44 * sin(360/365 * (N - 81))
  const declinationDeg = useMemo(() => {
    const rad = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
    return 23.44 * Math.sin(rad);
  }, [dayOfYear]);

  // Determine active face based on declination if in 'auto' mode
  const effectiveFace = useMemo(() => {
    if (activeFace === '3d') return '3d';
    if (activeFace === 'north') return 'north';
    if (activeFace === 'south') return 'south';
    // auto: if declination >= 0, northern face; if < 0, southern face
    return declinationDeg >= 0 ? 'north' : 'south';
  }, [activeFace, declinationDeg]);

  // Hour angle H in degrees: (Hour - 12) * 15°
  // At 12:00, H = 0°. At 06:00, H = -90°. At 18:00, H = +90°.
  const hourAngleDeg = useMemo(() => {
    return (solarHour - 12) * 15;
  }, [solarHour]);

  // Shadow angle on the dial plate:
  // In an equatorial sundial, because the dial plate is in the celestial equatorial plane,
  // the shadow is always directly opposite to the sun's hour angle:
  // Theta_shadow = Hour Angle on the northern face (clockwise in northern face)
  const shadowAngleDeg = hourAngleDeg;

  // Equation of Time (EoT) approximation in minutes
  const equationOfTimeMin = useMemo(() => {
    const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
    const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
    return Math.round(eot * 10) / 10;
  }, [dayOfYear]);

  // Solar Altitude & Azimuth approximation
  const solarElevation = useMemo(() => {
    const latRad = (latitude * Math.PI) / 180;
    const decRad = (declinationDeg * Math.PI) / 180;
    const hRad = (hourAngleDeg * Math.PI) / 180;
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad);
    return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * (180 / Math.PI);
  }, [latitude, declinationDeg, hourAngleDeg]);

  // Date formatted from day of year (for 2026 non-leap year)
  const formattedDate = useMemo(() => {
    const date = new Date(2026, 0); // Jan 1 2026
    date.setDate(dayOfYear);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  }, [dayOfYear]);

  // Hour string
  const formattedHour = useMemo(() => {
    const h = Math.floor(solarHour);
    const m = Math.floor((solarHour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} hrs`;
  }, [solarHour]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setSolarHour(prev => {
        let next = prev + delta * 0.75; // 0.75 hour per second
        if (next > 18.5) next = 5.5;
        return next;
      });
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Presets for quick pedagogical demonstrations
  const setCityPreset = (lat: number) => {
    setLatitude(lat);
  };

  const setSeasonPreset = (day: number) => {
    setDayOfYear(day);
  };

  // Generate 24 hour tick marks for circular plate (every 15 degrees)
  const hourTicks = useMemo(() => {
    const ticks = [];
    for (let h = 0; h < 24; h++) {
      const angle = (h - 12) * 15; // 12 is at bottom or top depending on convention
      // In northern face: 12 is South/Bottom, 6 is West/Right, 18 is East/Left
      const rad = ((angle + 90) * Math.PI) / 180;
      const rInner = 145;
      const rOuter = 165;
      const rText = 125;
      const x1 = 180 + rInner * Math.cos(rad);
      const y1 = 180 + rInner * Math.sin(rad);
      const x2 = 180 + rOuter * Math.cos(rad);
      const y2 = 180 + rOuter * Math.sin(rad);
      const tx = 180 + rText * Math.cos(rad);
      const ty = 180 + rText * Math.sin(rad);

      // Roman numerals for display
      const romanHours = [
        'XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI',
        'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII'
      ];

      // Daytime hours (05 to 19)
      const isDaytime = h >= 5 && h <= 19;

      ticks.push({
        hour: h,
        label: romanHours[h % 24],
        num: `${h}:00`,
        x1, y1, x2, y2, tx, ty,
        angle,
        isMajor: h % 6 === 0,
        isDaytime
      });
    }
    return ticks;
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header bar with title & AI Studio Applet direct link */}
      <div className="px-6 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 bg-stone-50/70">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600 animate-pulse" />
            <h3 className="text-base font-semibold text-stone-900 font-display">
              Simulador Gnomónico de Reloj Ecuatorial
            </h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-medium">
              Geometría Polar 15°/h
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Interacción dinámica entre latitud local, ángulo horario y declinación solar estacional
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmbedApplet(!showEmbedApplet)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 transition-colors font-medium flex items-center gap-1.5 shadow-2xs"
          >
            {showEmbedApplet ? (
              <>
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                Volver a Simulador 2.5D
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-stone-500" />
                Incrustar Applet AI Studio
              </>
            )}
          </button>

          <a
            href={appletUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3.5 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors font-medium flex items-center gap-1.5 shadow-sm"
          >
            <span>Abrir en AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {showEmbedApplet ? (
        <div className="p-4 bg-stone-900">
          <div className="rounded-xl overflow-hidden border border-stone-700 bg-black aspect-video max-h-[640px] w-full relative">
            <iframe
              src={appletUrl}
              title="Reloj Ecuatorial Applet AI Studio"
              className="w-full h-full border-0"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">
            Applet original: <a href={appletUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">{appletUrl}</a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Visual stage / Canvas (7 cols on desktop) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center bg-radial from-amber-50/40 via-stone-50/80 to-stone-100/70 border-b lg:border-b-0 lg:border-r border-stone-200 relative min-h-[460px]">
            {/* View Mode Switcher */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1 p-1 bg-white/90 backdrop-blur-xs rounded-lg border border-stone-200 shadow-2xs">
              <button
                onClick={() => setActiveFace('auto')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFace === 'auto'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Selección automática según declinación solar estacional"
              >
                Auto ({declinationDeg >= 0 ? 'Norte' : 'Sur'})
              </button>
              <button
                onClick={() => setActiveFace('north')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFace === 'north'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cara Norte (Verano)
              </button>
              <button
                onClick={() => setActiveFace('south')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFace === 'south'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cara Sur (Invierno)
              </button>
              <button
                onClick={() => setActiveFace('3d')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFace === '3d'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Inclinación 3D
              </button>
            </div>

            {/* Quick status pill inside stage */}
            <div className="absolute top-4 right-4 z-10 text-xs font-mono bg-white/90 backdrop-blur-xs border border-stone-200 rounded-md px-2.5 py-1 text-stone-700 shadow-2xs">
              {solarElevation > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sol Visible (+{Math.round(solarElevation)}°)
                </span>
              ) : (
                <span className="text-stone-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-stone-300"></span>
                  Noche / Oculto
                </span>
              )}
            </div>

            {/* Main Interactive Diagram rendering */}
            {effectiveFace === '3d' ? (
              /* 3D Side Elevation Diagram showing the mounting geometry */
              <div className="w-full max-w-[400px] h-[360px] relative flex items-center justify-center">
                <svg viewBox="0 0 400 360" className="w-full h-full">
                  <defs>
                    <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#78716c" />
                      <stop offset="100%" stopColor="#57534e" />
                    </linearGradient>
                    <linearGradient id="sunBeam" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
                      <stop offset="100%" stopColor="rgba(245, 158, 11, 0.0)" />
                    </linearGradient>
                  </defs>

                  {/* Ground base (horizontal) */}
                  <rect x="30" y="290" width="340" height="12" rx="3" fill="url(#groundGrad)" />
                  <line x1="20" y1="290" x2="380" y2="290" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="40" y="320" fill="#78716c" fontSize="11" fontFamily="sans-serif">Horizonte Local (Plano Horizontal)</text>

                  {/* Meridian directions */}
                  <text x="340" y="320" fill="#78716c" fontSize="11" fontWeight="bold">SUR</text>
                  <text x="50" y="280" fill="#78716c" fontSize="11" fontWeight="bold">NORTE</text>

                  {/* Pedestal / Pillar */}
                  <path d="M 180,290 L 190,200 L 210,200 L 220,290 Z" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="1.5" />

                  {/* Central mount point at (200, 200) */}
                  {/* Latitude angle arc from horizon to gnomon: phi */}
                  {/* Let tiltAngle = latitude in degrees */}
                  {(() => {
                    const cx = 200;
                    const cy = 200;
                    const phiRad = (latitude * Math.PI) / 180;
                    // Gnomon points up-left towards North Celestial Pole
                    const gnomonLen = 130;
                    const gx = cx - gnomonLen * Math.cos(phiRad);
                    const gy = cy - gnomonLen * Math.sin(phiRad);
                    // Opposite gnomon tail
                    const gxTail = cx + (gnomonLen * 0.4) * Math.cos(phiRad);
                    const gyTail = cy + (gnomonLen * 0.4) * Math.sin(phiRad);

                    // Equatorial dial plate is strictly perpendicular to gnomon:
                    // Plate angle = phiRad + Math.PI/2
                    const plateRadius = 90;
                    const px1 = cx - plateRadius * Math.sin(phiRad);
                    const py1 = cy + plateRadius * Math.cos(phiRad);
                    const px2 = cx + plateRadius * Math.sin(phiRad);
                    const py2 = cy - plateRadius * Math.cos(phiRad);

                    return (
                      <g>
                        {/* Latitude angle arc */}
                        <path
                          d={`M ${cx - 60},${cy} A 60 60 0 0 0 ${cx - 60 * Math.cos(phiRad)},${cy - 60 * Math.sin(phiRad)}`}
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2"
                        />
                        <text
                          x={cx - 75}
                          y={cy - 20}
                          fill="#b45309"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          φ = {latitude.toFixed(1)}°
                        </text>

                        {/* Equatorial Plate (perpendicular to polar axis) */}
                        <line
                          x1={px1}
                          y1={py1}
                          x2={px2}
                          y2={py2}
                          stroke="#0284c7"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <line
                          x1={px1}
                          y1={py1}
                          x2={px2}
                          y2={py2}
                          stroke="#38bdf8"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Dial plate label */}
                        <text
                          x={px2 + 10}
                          y={py2}
                          fill="#0369a1"
                          fontSize="11"
                          fontWeight="600"
                        >
                          Disco Ecuatorial (inclinado a {Math.round(90 - latitude)}°)
                        </text>

                        {/* Gnomon / Polar Axis */}
                        <line
                          x1={gxTail}
                          y1={gyTail}
                          x2={gx}
                          y2={gy}
                          stroke="#d97706"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        <circle cx={gx} cy={gy} r="4" fill="#b45309" />
                        <text
                          x={gx - 10}
                          y={gy - 12}
                          fill="#92400e"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          → Polo Norte Celeste
                        </text>

                        {/* Center pivot point */}
                        <circle cx={cx} cy={cy} r="6" fill="#1c1917" stroke="#fff" strokeWidth="2" />
                      </g>
                    );
                  })()}
                </svg>
                <div className="absolute bottom-2 left-4 text-xs text-stone-500 bg-white/80 px-2 py-1 rounded">
                  Inclinación con el suelo = 90° - φ = <strong className="text-stone-800">{(90 - latitude).toFixed(1)}°</strong>
                </div>
              </div>
            ) : (
              /* Dial Plate Direct Face View (North or South face) */
              <div className="w-full max-w-[380px] aspect-square relative flex items-center justify-center">
                <svg viewBox="0 0 360 360" className="w-full h-full drop-shadow-md">
                  <defs>
                    <radialGradient id="brassPlate" cx="45%" cy="45%" r="60%">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="65%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#fde68a" />
                    </radialGradient>
                    <radialGradient id="shadowBlur" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(30, 41, 59, 0.7)" />
                      <stop offset="100%" stopColor="rgba(30, 41, 59, 0.0)" />
                    </radialGradient>
                    <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Outer brass ring */}
                  <circle cx="180" cy="180" r="172" fill="#d97706" />
                  <circle cx="180" cy="180" r="169" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
                  <circle cx="180" cy="180" r="166" fill="url(#brassPlate)" stroke="#d97706" strokeWidth="2" />
                  <circle cx="180" cy="180" r="144" fill="none" stroke="#b45309" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="180" cy="180" r="110" fill="#fffef8" stroke="#d97706" strokeWidth="1.5" />

                  {/* Cardinal orientation text */}
                  <text x="180" y="32" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="bold" fontFamily="serif">
                    {effectiveFace === 'north' ? '12:00 (MEDIODÍA SOLAR - SUR)' : '12:00 (MEDIODÍA SOLAR - NORTE)'}
                  </text>
                  <text x="180" y="345" textAnchor="middle" fill="#78716c" fontSize="10" fontFamily="sans-serif">
                    {effectiveFace === 'north' ? 'CARA SUPERIOR (PRIMAVERA / VERANO)' : 'CARA INFERIOR (OTOÑO / INVIERNO)'}
                  </text>

                  {/* Hour markers every 15° */}
                  {hourTicks.map(tick => {
                    // For northern face: Noon (12h) is at bottom or top; convention is 12h = South (top in standard solar view or bottom)
                    // Let's render 12:00 at y = 180 + r (bottom) or y = 180 - r (top).
                    // In northern hemisphere looking down at dial: Sun passes in South at noon.
                    return (
                      <g key={tick.hour} opacity={tick.isDaytime ? 1 : 0.45}>
                        <line
                          x1={tick.x1}
                          y1={tick.y1}
                          x2={tick.x2}
                          y2={tick.y2}
                          stroke={tick.isMajor ? '#92400e' : '#b45309'}
                          strokeWidth={tick.isMajor ? 2.5 : 1.2}
                        />
                        {tick.hour % 2 === 0 && (
                          <text
                            x={tick.tx}
                            y={tick.ty + 4}
                            textAnchor="middle"
                            fill={tick.isMajor ? '#78350f' : '#92400e'}
                            fontSize={tick.isMajor ? '11' : '9'}
                            fontWeight={tick.isMajor ? 'bold' : 'normal'}
                            fontFamily="serif"
                          >
                            {tick.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Sub-divisions: 15-minute tick marks */}
                  {Array.from({ length: 96 }).map((_, i) => {
                    const angle = (i * 3.75 - 90) * (Math.PI / 180);
                    const r1 = 160;
                    const r2 = i % 4 === 0 ? 165 : 162;
                    return (
                      <line
                        key={`sub-${i}`}
                        x1={180 + r1 * Math.cos(angle)}
                        y1={180 + r1 * Math.sin(angle)}
                        x2={180 + r2 * Math.cos(angle)}
                        y2={180 + r2 * Math.sin(angle)}
                        stroke="#d97706"
                        strokeWidth="0.75"
                        opacity={0.6}
                      />
                    );
                  })}

                  {/* Shadow of the central Gnomon */}
                  {solarElevation > 0 ? (
                    (() => {
                      // Shadow calculation:
                      // On the equatorial plate, the shadow angle equals the hour angle H!
                      // When H = 0 (12:00), shadow points along meridian line (angle 90° down or up).
                      // Effective angle on plate:
                      const shadowRad = ((shadowAngleDeg + 90) * Math.PI) / 180;
                      const shadowLen = 142;
                      const sx = 180 + shadowLen * Math.cos(shadowRad);
                      const sy = 180 + shadowLen * Math.sin(shadowRad);

                      return (
                        <g filter="url(#shadowFilter)">
                          {/* Soft shadow blur triangle */}
                          <polygon
                            points={`180,180 ${sx - 4 * Math.sin(shadowRad)},${sy + 4 * Math.cos(shadowRad)} ${sx + 4 * Math.sin(shadowRad)},${sy - 4 * Math.cos(shadowRad)}`}
                            fill="rgba(15, 23, 42, 0.45)"
                          />
                          {/* Core sharp shadow line */}
                          <line
                            x1="180"
                            y1="180"
                            x2={sx}
                            y2={sy}
                            stroke="#0f172a"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })()
                  ) : (
                    <text x="180" y="215" textAnchor="middle" fill="#94a3b8" fontSize="12" fontStyle="italic">
                      Sol bajo el horizonte (sin sombra)
                    </text>
                  )}

                  {/* Central Gnomon cross-section pin */}
                  <circle cx="180" cy="180" r="10" fill="#78350f" stroke="#fef3c7" strokeWidth="2" />
                  <circle cx="180" cy="180" r="5" fill="#f59e0b" />
                  <circle cx="180" cy="180" r="2" fill="#fff" />
                </svg>

                {/* Sub-label under dial */}
                <div className="absolute -bottom-2 text-center text-xs text-stone-600 bg-white/90 border border-stone-200 px-3 py-1 rounded-full shadow-2xs">
                  Sombra solar en: <strong className="text-stone-900 font-mono">{formattedHour}</strong> (Ángulo Horario: <span className="font-mono">{hourAngleDeg.toFixed(1)}°</span>)
                </div>
              </div>
            )}
          </div>

          {/* Controls & Scientific Deck (5 cols on desktop) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-5">
              {/* Primary Hour Control Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hora Solar Verdadera:</span>
                  </label>
                  <span className="text-sm font-bold text-amber-900 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {formattedHour}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-2xs shrink-0"
                    title={isPlaying ? 'Pausar rotación solar' : 'Animar paso de las horas'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <input
                    type="range"
                    min="5.0"
                    max="19.0"
                    step="0.05"
                    value={solarHour}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setSolarHour(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setSolarHour(12.0);
                    }}
                    className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs shrink-0"
                    title="Restablecer a Mediodía Solar (12:00)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>06:00 (Amanecer)</span>
                  <span>12:00 (Cénit)</span>
                  <span>18:00 (Atardecer)</span>
                </div>
              </div>

              {/* Latitude Control Slider */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Latitud Geográfica (φ):</span>
                  </label>
                  <span className="text-xs font-bold text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded">
                    {latitude >= 0 ? `${latitude.toFixed(2)}° N` : `${Math.abs(latitude).toFixed(2)}° S`}
                  </span>
                </div>

                <input
                  type="range"
                  min="-60"
                  max="75"
                  step="0.5"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                {/* City presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => setCityPreset(25.67)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      Math.abs(latitude - 25.67) < 0.5
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Monterrey (25.67°N)
                  </button>
                  <button
                    onClick={() => setCityPreset(19.43)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      Math.abs(latitude - 19.43) < 0.5
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    CDMX (19.43°N)
                  </button>
                  <button
                    onClick={() => setCityPreset(23.44)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      Math.abs(latitude - 23.44) < 0.5
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Trópico Cáncer (23.44°N)
                  </button>
                  <button
                    onClick={() => setCityPreset(0.0)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      Math.abs(latitude - 0.0) < 0.5
                        ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Ecuador (0°)
                  </button>
                </div>
              </div>

              {/* Day of Year / Solar Declination Slider */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fecha y Declinación (δ):</span>
                  </label>
                  <div className="text-right">
                    <span className="text-xs font-medium text-stone-900 block">{formattedDate}</span>
                    <span className="text-[11px] font-mono text-emerald-700">
                      δ = {declinationDeg >= 0 ? `+${declinationDeg.toFixed(1)}°` : `${declinationDeg.toFixed(1)}°`}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="365"
                  value={dayOfYear}
                  onChange={(e) => setDayOfYear(parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                {/* Season presets */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => setSeasonPreset(80)} // March 21
                    className={`text-[11px] px-2 py-1 rounded border text-left transition-colors ${
                      dayOfYear === 80
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🌸 Equinoccio Primavera (21 Mar)
                  </button>
                  <button
                    onClick={() => setSeasonPreset(172)} // June 21
                    className={`text-[11px] px-2 py-1 rounded border text-left transition-colors ${
                      dayOfYear === 172
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    ☀️ Solsticio Verano (21 Jun)
                  </button>
                  <button
                    onClick={() => setSeasonPreset(266)} // Sept 23
                    className={`text-[11px] px-2 py-1 rounded border text-left transition-colors ${
                      dayOfYear === 266
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    🍂 Equinoccio Otoño (23 Sep)
                  </button>
                  <button
                    onClick={() => setSeasonPreset(355)} // Dec 21
                    className={`text-[11px] px-2 py-1 rounded border text-left transition-colors ${
                      dayOfYear === 355
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    ❄️ Solsticio Invierno (21 Dic)
                  </button>
                </div>
              </div>

              {/* Scientific Parameters Card */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Ángulo Horario (H):</span>
                  <span className="font-mono font-semibold text-stone-800">{hourAngleDeg.toFixed(1)}°</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Inclinación Gnomon (Polo):</span>
                  <span className="font-mono font-semibold text-stone-800">{latitude.toFixed(1)}° con horizonte</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Inclinación Disco Ecuatorial:</span>
                  <span className="font-mono font-semibold text-stone-800">{(90 - latitude).toFixed(1)}° con horizonte</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Ecuación del Tiempo (Et):</span>
                  <span className="font-mono font-semibold text-stone-800">
                    {equationOfTimeMin >= 0 ? `+${equationOfTimeMin} min` : `${equationOfTimeMin} min`}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                  <span className="text-stone-500">Cara activa iluminada:</span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {declinationDeg >= 0 ? 'Cara Superior (Norte)' : 'Cara Inferior (Sur)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Educational insight note */}
            <div className="text-[11px] text-stone-500 bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 flex gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 font-semibold block">Clave pedagógica para secundaria:</strong>
                Como el plano del disco es paralelo al ecuador celeste y el gnomon coincide con el eje terrestre, 
                la sombra avanza rigurosamente a <strong>15° por cada hora solar</strong> (360° / 24h = 15°/h).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
