import { ScenarioPreset } from '../types/sundial';

/**
 * Converts a solar decimal hour (0.0 to 24.0) to hour angle H in degrees (-180° to +180°).
 * At 12:00 (Solar Noon), H = 0°.
 * At 06:00 (Sunrise equinox), H = -90°.
 * At 18:00 (Sunset equinox), H = +90°.
 */
export function hourToHourAngle(hour: number): number {
  return ((hour - 12) * 15);
}

/**
 * Converts hour angle H in degrees to solar decimal hour (0.0 to 24.0).
 */
export function hourAngleToHour(h: number): number {
  let hour = (h / 15) + 12;
  while (hour < 0) hour += 24;
  while (hour >= 24) hour -= 24;
  return hour;
}

/**
 * Approximate solar declination delta in degrees from day of year (1 to 365).
 * Formula: delta = 23.44° * sin((360/365) * (N - 81)°)
 */
export function calculateDeclination(dayOfYear: number): number {
  const rad = ((360 / 365) * (dayOfYear - 81) * Math.PI) / 180;
  return 23.44 * Math.sin(rad);
}

/**
 * Computes solar elevation (altitude above horizon) and azimuth (from True North, 0° to 360°).
 */
export function calculateSolarCoordinates(
  latitude: number,
  declination: number,
  hourAngle: number
): { elevation: number; azimuth: number } {
  const phi = (latitude * Math.PI) / 180;
  const delta = (declination * Math.PI) / 180;
  const H = (hourAngle * Math.PI) / 180;

  // Sin(elevation) = sin(phi) * sin(delta) + cos(phi) * cos(delta) * cos(H)
  const sinElev = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinElev))) * (180 / Math.PI);

  // Cos(azimuth) and Sin(azimuth)
  // cos(a) = (sin(delta) - sin(phi)*sin(elev)) / (cos(phi)*cos(elev))
  const cosElev = Math.cos((elevation * Math.PI) / 180);
  let azimuth = 180; // default south

  if (Math.abs(cosElev) > 0.0001) {
    const cosAz = (Math.sin(delta) - Math.sin(phi) * sinElev) / (Math.cos(phi) * cosElev);
    const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
    const azBase = Math.acos(clampedCosAz) * (180 / Math.PI);

    // If H > 0 (afternoon), azimuth is 360° - azBase; if H <= 0 (morning), azimuth is azBase
    // In standard meteorological convention: 0 = North, 90 = East, 180 = South, 270 = West
    if (Math.sin(H) > 0) {
      azimuth = 360 - azBase;
    } else {
      azimuth = azBase;
    }
  }

  return {
    elevation,
    azimuth: (azimuth + 360) % 360,
  };
}

/**
 * Formats decimal hour into HH:MM or 12h AM/PM string.
 */
export function formatSolarHour(hour: number, is12h = false): { timeStr: string; period?: string } {
  let normalized = ((hour % 24) + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);

  if (is12h) {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return {
      timeStr: `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`,
      period,
    };
  }

  return {
    timeStr: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} hrs`,
  };
}

/**
 * Formats day of year into readable date string in Spanish.
 */
export function formatDayOfYear(day: number): string {
  const date = new Date(2026, 0); // 2026 non-leap
  date.setDate(day);
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}

/**
 * Educational Scenario presets for teaching in normal school & secondary classrooms.
 */
export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'solar_noon_equinox',
    name: 'Mediodía Solar en Equinoccio',
    description: 'Paso del Sol por la meridiana (H = 0°), declinación δ ≈ 0°. Sombra perfectamente orientada sobre el eje Norte-Sur.',
    hour: 12.0,
    hourAngle: 0,
    declination: 0.0,
    dayOfYear: 80,
    dateStr: '21 de Marzo (Equinoccio)',
    expectedFace: 'upper',
  },
  {
    id: 'summer_solstice_noon',
    name: 'Solsticio de Verano (Cara Superior)',
    description: 'Declinación máxima septentrional (δ = +23.44°). La sombra se proyecta sobre la cara superior (Norte).',
    hour: 12.0,
    hourAngle: 0,
    declination: 23.44,
    dayOfYear: 172,
    dateStr: '21 de Junio (Solsticio)',
    expectedFace: 'upper',
  },
  {
    id: 'winter_solstice_noon',
    name: 'Solsticio de Invierno (Cara Inferior)',
    description: 'Declinación máxima meridional (δ = -23.44°). La sombra se proyecta sobre la cara inferior (Sur).',
    hour: 12.0,
    hourAngle: 0,
    declination: -23.44,
    dayOfYear: 355,
    dateStr: '21 de Diciembre (Solsticio)',
    expectedFace: 'lower',
  },
  {
    id: 'equinox_sunrise',
    name: 'Amanecer Equinoccial (06:00)',
    description: 'El Sol emerge exactamente por el punto Este geográfico. Ángulo horario H = -90° (sombra rasante hacia el Oeste).',
    hour: 6.0,
    hourAngle: -90,
    declination: 0.0,
    dayOfYear: 80,
    dateStr: '21 de Marzo (06:00)',
    expectedFace: 'upper',
  },
  {
    id: 'equinox_sunset',
    name: 'Atardecer Equinoccial (18:00)',
    description: 'El Sol se oculta por el punto Oeste geográfico. Ángulo horario H = +90° (sombra rasante hacia el Este).',
    hour: 18.0,
    hourAngle: 90,
    declination: 0.0,
    dayOfYear: 80,
    dateStr: '21 de Marzo (18:00)',
    expectedFace: 'upper',
  },
  {
    id: 'monterrey_normal_school',
    name: 'Normal Superior Moisés Sáenz (Monterrey)',
    description: 'Calibración a latitud local de Monterrey (25.67° N). Ángulo de inclinación del gnomon = 25.67° con el suelo horizontal.',
    hour: 13.5,
    hourAngle: 22.5,
    declination: 15.0,
    dayOfYear: 125,
    dateStr: '5 de Mayo',
    expectedFace: 'upper',
  },
];
