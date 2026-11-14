// Reglas de avance compartidas por la página y por el servidor (functions/api).
import type { Modulo } from './types';
import { APROBATORIO } from './types';

export interface Entrega {
  id: string;
  sesion: number;
  key: string;
  nombre: string;
  tipo: string;
  estado: 'pendiente' | 'revisada' | 'corregir';
  comentario?: string;
  fecha: string;
  url?: string; // solo en modo demo (dataURL)
}

export interface ProgresoSesion {
  terminada: boolean;
  respuestas: Record<string, string>;
  simuladores: string[];
  actualizado?: string;
}

export interface ProgresoModulo {
  sesiones: Record<number, ProgresoSesion>;
  repasos: Record<number, { mejor: number; intentos: number }>; // fase -> mejor % (0-1)
  entregas: Entrega[];
  certificado?: { folio: string; fecha: string } | null;
}

export const progresoVacio = (): ProgresoModulo => ({ sesiones: {}, repasos: {}, entregas: [], certificado: null });

export interface EstadoFase {
  numero: number;
  abierta: boolean;
  sesionesTerminadas: number;
  sesionesTotal: number;
  repaso: number | null;
  aprobada: boolean;
}

export function estadoFases(m: Modulo, p: ProgresoModulo): EstadoFase[] {
  const res: EstadoFase[] = [];
  let anteriorAprobada = true;
  for (const f of m.fases) {
    const total = f.sesiones.length;
    const hechas = f.sesiones.filter((s) => p.sesiones[s.numero]?.terminada).length;
    const repaso = p.repasos[f.numero]?.mejor ?? null;
    const aprobada = anteriorAprobada && hechas === total && repaso !== null && repaso >= APROBATORIO;
    res.push({ numero: f.numero, abierta: anteriorAprobada, sesionesTerminadas: hechas, sesionesTotal: total, repaso, aprobada });
    anteriorAprobada = aprobada;
  }
  return res;
}

/** Porcentaje 0–100: cada sesión terminada y cada repaso aprobado cuentan igual. */
export function porcentaje(m: Modulo, p: ProgresoModulo): number {
  const fases = estadoFases(m, p);
  const total = fases.reduce((a, f) => a + f.sesionesTotal + 1, 0);
  const hecho = fases.reduce((a, f) => a + f.sesionesTerminadas + (f.repaso !== null && f.repaso >= APROBATORIO ? 1 : 0), 0);
  return total ? Math.round((hecho / total) * 100) : 0;
}

export const sesionEvidenciaFinal = (m: Modulo) => m.fases[m.fases.length - 2]?.sesiones.slice(-1)[0]?.numero ?? 0;

export function puedeCertificado(m: Modulo, p: ProgresoModulo): { ok: boolean; falta: string[] } {
  const falta: string[] = [];
  estadoFases(m, p).forEach((f, i) => {
    if (!f.aprobada) falta.push(`Aprobar la fase ${f.numero}: ${m.fases[i].nombre}`);
  });
  const ev = sesionEvidenciaFinal(m);
  if (!p.entregas.some((e) => e.sesion === ev)) falta.push(`Subir tu evidencia final (sesión ${ev})`);
  return { ok: falta.length === 0, falta };
}
