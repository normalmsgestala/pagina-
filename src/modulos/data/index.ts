import type { Modulo } from '../types';
import { explorandoElUniverso } from './explorando-el-universo';
import { fisicaEnMovimiento } from './fisica-en-movimiento';

// Agrega aquí cada módulo nuevo.
export const MODULOS: Modulo[] = [explorandoElUniverso, fisicaEnMovimiento];

export const getModulo = (id: string) => MODULOS.find((m) => m.id === id);

export const todasLasSesiones = (m: Modulo) => m.fases.flatMap((f) => f.sesiones);
