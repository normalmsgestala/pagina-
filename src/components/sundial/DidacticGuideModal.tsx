import React from 'react';
import { X, BookOpen, Sun, Compass, Clock, Award, CheckCircle } from 'lucide-react';

interface DidacticGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DidacticGuideModal: React.FC<DidacticGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col my-8 text-xs text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Guía Didáctica: El Reloj Ecuatorial en Educación Secundaria
              </h3>
              <p className="text-[11px] text-slate-400">
                Fundamentos físicos, gnomónica instrumental y orientaciones pedagógicas para profesores
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 leading-relaxed">
          {/* Section 1: The 15° Principle */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sun className="w-4 h-4" />
              <span>1. El Principio Universal de los 15°</span>
            </div>
            <p className="text-slate-300">
              La Tierra completa una rotación de 360° en 24 horas solares. Esto significa que el Sol recorre 
              aparentemente el firmamento a un ritmo riguroso de:
            </p>
            <div className="p-2.5 bg-slate-950 rounded-lg text-center font-mono text-amber-300 font-bold text-sm">
              360° ÷ 24 horas = 15° cada hora
            </div>
            <p className="text-slate-300">
              En un reloj de sol horizontal o vertical tradicional, la sombra se distorsiona porque la superficie no es perpendicular al eje de rotación. 
              En cambio, en el <strong>reloj ecuatorial</strong>, el cuadrante es paralelo al ecuador terrestre y perpendicular al eje polar, 
              por lo que <strong>todas las horas quedan divididas en sectores de 15° idénticos</strong>.
            </p>
          </div>

          {/* Section 2: Inclinación y Latitud */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Compass className="w-4 h-4" />
              <span>2. Inclinación del Gnomon según la Latitud Geográfica</span>
            </div>
            <p className="text-slate-300">
              El gnomon debe apuntar al <strong>Polo Norte Celeste</strong> (cerca de la estrella Polar en el hemisferio norte). 
              Por geometría esférica, la elevación del polo sobre el horizonte local es numéricamente igual a la <strong>latitud (φ)</strong> del lugar:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li>
                <strong>Inclinación del gnomon con el suelo horizontal:</strong> ángulo = φ (en Monterrey: 25.67°).
              </li>
              <li>
                <strong>Inclinación de la placa ecuatorial con el suelo:</strong> ángulo = 90° - φ (en Monterrey: 64.33°).
              </li>
              <li>
                <strong>Alineación del eje:</strong> строго sobre la línea Norte-Sur geográfica verdadera.
              </li>
            </ul>
          </div>

          {/* Section 3: Dual Face System */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>3. Las Dos Caras Estacionales (Superior e Inferior)</span>
            </div>
            <p className="text-slate-300">
              Debido a la inclinación del eje terrestre (23.44°), la posición del Sol respecto al ecuador celeste cambia a lo largo del año:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-700">
                <strong className="text-amber-400 block font-bold">Cara Superior (Norte):</strong>
                <span className="text-slate-300 text-[11px]">
                  Activa del 21 de marzo al 23 de septiembre (Primavera y Verano, cuando δ &gt; 0).
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-700">
                <strong className="text-sky-400 block font-bold">Cara Inferior (Sur):</strong>
                <span className="text-slate-300 text-[11px]">
                  Activa del 23 de septiembre al 21 de marzo (Otoño e Invierno, cuando δ &lt; 0).
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Suggested Classroom Sequence */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Award className="w-4 h-4" />
              <span>4. Secuencia de Aprendizaje para Secundaria (2º Grado)</span>
            </div>
            <ol className="space-y-2 pl-4 list-decimal text-slate-300">
              <li>
                <strong>Fase de indagación previa:</strong> Preguntar a los alumnos si el Sol siempre está a 90° sobre nosotros a mediodía.
              </li>
              <li>
                <strong>Construcción con transportador:</strong> Armar un reloj ecuatorial en cartoncillo usando la latitud de la escuela.
              </li>
              <li>
                <strong>Observación y toma de datos:</strong> Registrar la sombra cada 30 minutos y verificar que avanza 7.5° cada media hora.
              </li>
              <li>
                <strong>Contraste con el reloj civil:</strong> Aplicar la corrección por longitud del meridiano oficial (GMT-6) y la Ecuación del Tiempo.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
