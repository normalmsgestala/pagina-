import type { Modulo } from '../types';
import { explorandoElUniverso } from './explorando-el-universo';
import { fisicaEnMovimiento } from './fisica-en-movimiento';
import { aguamedNl } from './aguamed-nl-caudal';

// Agrega aquí cada módulo nuevo.
export const MODULOS: Modulo[] = [explorandoElUniverso, fisicaEnMovimiento, aguamedNl];

export const getModulo = (id: string) => MODULOS.find((m) => m.id === id);

export const todasLasSesiones = (m: Modulo) => m.fases.flatMap((f) => f.sesiones);
