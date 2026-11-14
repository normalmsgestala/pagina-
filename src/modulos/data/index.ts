import type { Modulo } from '../types';
import { explorandoElUniverso } from './explorando-el-universo';

// Agrega aquí cada módulo nuevo.
export const MODULOS: Modulo[] = [explorandoElUniverso];

export const getModulo = (id: string) => MODULOS.find((m) => m.id === id);

export const todasLasSesiones = (m: Modulo) => m.fases.flatMap((f) => f.sesiones);
