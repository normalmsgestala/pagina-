import React, { useState } from 'react';
import { SundialState } from '../../types/sundial';
import { Trophy, CheckCircle, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';

interface StudentChallengesProps {
  state: SundialState;
}

interface Challenge {
  id: string;
  title: string;
  question: string;
  targetCriteria: (s: SundialState) => { passed: boolean; feedback: string };
  hint: string;
}

export const StudentChallenges: React.FC<StudentChallengesProps> = ({ state }) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string>('chal-1');
  const [result, setResult] = useState<{ passed: boolean; feedback: string } | null>(null);

  const CHALLENGES: Challenge[] = [
    {
      id: 'chal-1',
      title: 'Desafío 1: El Mediodía Solar (H = 0°)',
      question: 'Ajusta el reloj para que el Sol pase exactamente por la meridiana local (mediodía solar verdadero: H = 0°, hora = 12:00 hrs).',
      targetCriteria: (s) => {
        const hourDiff = Math.abs(s.solarHour - 12.0);
        if (hourDiff <= 0.15 || Math.abs(s.hourAngle) <= 2) {
          return {
            passed: true,
            feedback: '¡Excelente! En el mediodía solar, la sombra del gnomon se alinea rigurosamente con la línea Norte-Sur (H = 0°).',
          };
        }
        return {
          passed: false,
          feedback: `Aún no estás en el mediodía. Tu hora actual es ${s.solarHour.toFixed(2)} hrs (H = ${s.hourAngle.toFixed(0)}°). Ajusta el deslizador a las 12:00.`,
        };
      },
      hint: 'Mueve el control de hora hasta marcar las 12:00 o presiona el botón "12:00".',
    },
    {
      id: 'chal-2',
      title: 'Desafío 2: Solsticio de Verano (Cara Superior)',
      question: 'Configura la fecha en torno al 21 de junio (día 172) y comprueba que la declinación solar sea máxima positiva (δ ≈ +23.44°).',
      targetCriteria: (s) => {
        if (s.solarDeclination >= 22.0) {
          return {
            passed: true,
            feedback: '¡Correcto! En el solsticio de verano la declinación es máxima positiva y la sombra se lee con nitidez en la cara superior (Norte).',
          };
        }
        return {
          passed: false,
          feedback: `La declinación actual es δ = ${s.solarDeclination.toFixed(1)}°. Necesitas alcanzar al menos +22° moviendo la fecha hacia junio.`,
        };
      },
      hint: 'En la sección de fecha, arrastra el control hacia el 21 de junio o selecciona el botón de Solsticio de Verano.',
    },
    {
      id: 'chal-3',
      title: 'Desafío 3: Calibración en la Normal Superior (25.67° N)',
      question: 'Ajusta la latitud geográfica a la de la Escuela Normal Profr. Moisés Sáenz en Monterrey, Nuevo León (25.67° N).',
      targetCriteria: (s) => {
        if (Math.abs(s.latitude - 25.67) <= 0.5) {
          return {
            passed: true,
            feedback: '¡Calibración exitosa! El gnomon polar ha quedado inclinado a 25.67° sobre la mesa horizontal de la Normal.',
          };
        }
        return {
          passed: false,
          feedback: `Tu latitud actual es ${s.latitude.toFixed(2)}°. Selecciona el preset "Monterrey, N.L." en el panel de Salón y Orientación.`,
        };
      },
      hint: 'Ve a la pestaña "Salón y Orientación" y haz clic en "Monterrey, N.L. (Normal Profr. Moisés Sáenz)".',
    },
    {
      id: 'chal-4',
      title: 'Desafío 4: Solsticio de Invierno (Cara Inferior)',
      question: 'Configura el reloj para el 21 de diciembre (día 355) y observa cómo la declinación se vuelve negativa (δ = -23.44°).',
      targetCriteria: (s) => {
        if (s.solarDeclination <= -22.0) {
          return {
            passed: true,
            feedback: '¡Perfecto! Cuando δ < 0, los rayos solares provienen del hemisferio celeste sur, iluminando la cara inferior del reloj.',
          };
        }
        return {
          passed: false,
          feedback: `La declinación es δ = ${s.solarDeclination.toFixed(1)}°. Necesitas que sea menor a -22° (diciembre).`,
        };
      },
      hint: 'Selecciona el Solsticio de Invierno (21 de diciembre) en los escenarios preparados.',
    },
  ];

  const currentChal = CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  const handleVerify = () => {
    const res = currentChal.targetCriteria(state);
    setResult(res);
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header */}
      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Desafíos Didácticos para Estudiantes Normalistas</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Pon a prueba tu dominio gnomónico y astronómico resolviendo estos desafíos interactivos diseñados para el aula escolar.
        </p>
      </div>

      {/* Challenge Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
        {CHALLENGES.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => {
              setActiveChallengeId(ch.id);
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
              activeChallengeId === ch.id
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            Desafío 0{idx + 1}
          </button>
        ))}
      </div>

      {/* Active Challenge Card */}
      <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">
            {currentChal.title}
          </h4>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {currentChal.question}
          </p>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-[11px] text-slate-400 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-300">Pista: </strong>
            {currentChal.hint}
          </div>
        </div>

        {/* Verification Button */}
        <button
          onClick={handleVerify}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
        >
          <span>Comprobar Estado Actual</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Verification Result Feedback */}
        {result && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-[11px] ${
              result.passed
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-amber-500/20 border-amber-400 text-amber-200'
            }`}
          >
            {result.passed ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <strong className="block font-bold">
                {result.passed ? '¡Misión Cumplida!' : 'Revisa tus parámetros:'}
              </strong>
              <p>{result.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
