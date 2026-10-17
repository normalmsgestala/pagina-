import React, { useState, useEffect } from 'react';
import { ModuleItem } from '../types/curriculum';
import { RollerCoasterSimulator } from './simulators/RollerCoasterSimulator';
import { FlyingChairsSimulator } from './simulators/FlyingChairsSimulator';
import { SwingingShipSimulator } from './simulators/SwingingShipSimulator';
import { EquatorialSundialSimulator } from './simulators/EquatorialSundialSimulator';
import { BumperCarsSimulator } from './simulators/BumperCarsSimulator';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  FileText, 
  Edit3, 
  Award,
  Layers
} from 'lucide-react';

interface ModuleDetailViewProps {
  module: ModuleItem;
  semesterName: string;
  allSemesterModules: ModuleItem[];
  onBackToSemester: () => void;
  onSelectModule: (mod: ModuleItem) => void;
  onEditModule: (mod: ModuleItem) => void;
  isEditMode: boolean;
}

export const ModuleDetailView: React.FC<ModuleDetailViewProps> = ({
  module,
  semesterName,
  allSemesterModules,
  onBackToSemester,
  onSelectModule,
  onEditModule,
  isEditMode
}) => {
  const simType = module.simulatorConfig?.type || 'none';
  const hasSimulator = simType !== 'none';

  // Default to simulator tab so user can appreciate the interactive simulator right away, or switch to 'guia'
  const [activeTab, setActiveTab] = useState<'simulator' | 'guia' | 'recursos'>(
    hasSimulator ? 'simulator' : 'guia'
  );

  useEffect(() => {
    const type = module.simulatorConfig?.type || 'none';
    setActiveTab(type !== 'none' ? 'simulator' : 'guia');
  }, [module.id, module.simulatorConfig?.type]);

  // Previous and Next team navigation
  const currentIndex = allSemesterModules.findIndex((m) => m.id === module.id);
  const prevModule = currentIndex > 0 ? allSemesterModules[currentIndex - 1] : null;
  const nextModule = currentIndex < allSemesterModules.length - 1 ? allSemesterModules[currentIndex + 1] : null;

  const renderSimulator = () => {
    switch (simType) {
      case 'roller-coaster':
        return <RollerCoasterSimulator />;
      case 'flying-chairs':
        return <FlyingChairsSimulator />;
      case 'swinging-ship':
        return <SwingingShipSimulator />;
      case 'equatorial-sundial':
        return (
          <EquatorialSundialSimulator
            appletUrl={module.simulatorConfig?.appletUrl}
            defaultLatitude={25.67}
          />
        );
      case 'bumper-cars':
        return <BumperCarsSimulator />;
      default:
        return (
          <div className="py-20 text-center text-stone-400 space-y-2 border border-dashed border-stone-200 rounded-2xl bg-white/50">
            <Compass className="w-6 h-6 text-stone-300 mx-auto" />
            <p className="text-xs font-mono text-stone-400">Simulador en blanco</p>
            <p className="text-xs text-stone-500">
              Aún no se ha integrado simulador para {module.shortName}.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Breadcrumb & Team Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200/70">
        <button
          onClick={onBackToSemester}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-stone-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a Proyectos del {semesterName}</span>
        </button>

        {/* Previous & Next Project Controls */}
        <div className="flex items-center gap-2">
          {prevModule ? (
            <button
              onClick={() => onSelectModule(prevModule)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-stone-400" />
              <span className="hidden sm:inline">Anterior:</span>
              <span className="font-semibold">{prevModule.teamName}</span>
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300 bg-stone-50 border border-stone-200/50 px-3 py-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Equipo 1</span>
            </button>
          )}

          {nextModule ? (
            <button
              onClick={() => onSelectModule(nextModule)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
            >
              <span className="hidden sm:inline">Siguiente:</span>
              <span className="font-semibold">{nextModule.teamName}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-300 bg-stone-50 border border-stone-200/50 px-3 py-1.5 rounded-lg opacity-40 cursor-not-allowed"
            >
              <span>Equipo 5</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {isEditMode && (
            <button
              onClick={() => onEditModule(module)}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition ml-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded">
            {module.teamName}
          </span>
          <span>·</span>
          <span>{semesterName}</span>
          <span>·</span>
          <span>{module.category}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tracking-tight">
          {module.title}
        </h1>
      </div>

      {/* Requerimientos Oficiales Card (Propósitos por Materia + Evaluación y Rúbrica Corta) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
            Propósitos por Materia (Qué solicita el proyecto)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
              <strong className="text-stone-900 block font-semibold">Mecánica</strong>
              <p className="text-stone-600 leading-relaxed">{module.subjectPurposes.mecanica}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
              <strong className="text-stone-900 block font-semibold">Álgebra para Física</strong>
              <p className="text-stone-600 leading-relaxed">{module.subjectPurposes.algebra}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
              <strong className="text-stone-900 block font-semibold">Tecnologías y Pedagogías Emergentes</strong>
              <p className="text-stone-600 leading-relaxed">{module.subjectPurposes.tecnologias}</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/70 space-y-1">
              <strong className="text-stone-900 block font-semibold">Didáctica de las Ciencias Experimentales</strong>
              <p className="text-stone-600 leading-relaxed">{module.subjectPurposes.didactica}</p>
            </div>
          </div>
        </div>

        {/* Evaluación y Rúbrica Corta */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Evaluación y Rúbrica Corta</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl border border-stone-200/70 bg-white">
              <strong className="text-stone-800 block text-xs uppercase font-mono mb-1">Criterio:</strong>
              <p className="text-stone-600">{module.rubric.criterio}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/70 bg-white">
              <strong className="text-stone-800 block text-xs uppercase font-mono mb-1">Nivel Esperado:</strong>
              <p className="text-stone-600">{module.rubric.nivelEsperado}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs: 1. Simulador Interactivo | 2. Estructura y Apartados del Proyecto (Títulos en blanco) | 3. Evidencias */}
      <div className="flex border-b border-stone-200 gap-4 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'simulator'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Simulador Interactivo</span>
          {hasSimulator && (
            <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
              Integrado
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('guia')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'guia'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Apartados del Proyecto (Guía Estructural en Blanco)</span>
        </button>

        <button
          onClick={() => setActiveTab('recursos')}
          className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'recursos'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evidencias y Recursos</span>
        </button>
      </div>

      {/* TAB 1: SIMULADOR INTERACTIVO */}
      {activeTab === 'simulator' && (
        <div className="animate-fadeIn">
          {renderSimulator()}
        </div>
      )}

      {/* TAB 2: ESTRUCTURA Y APARTADOS DEL PROYECTO (SOLO TÍTULOS CON CONTENIDO EN BLANCO) */}
      {activeTab === 'guia' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                Guía de Estructura del Proyecto · {module.teamName}
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-display">
                Apartados Correspondientes del Proyecto (Información en Blanco)
              </h3>
              <p className="text-xs text-stone-500">
                Se muestran únicamente los títulos y subtítulos de cada apartado como guía de estructura. La información se encuentra en blanco lista para integrarse.
              </p>
            </div>
            {isEditMode && (
              <button
                onClick={() => onEditModule(module)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 cursor-pointer"
              >
                Editar Apartados
              </button>
            )}
          </div>

          {/* List of Guide Sections with Titles Only and Blank Body */}
          <div className="grid grid-cols-1 gap-4">
            {(module.guideSections || []).map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-stone-900 font-display">
                      {sec.title}
                    </h4>
                    {/* Subtitles of what belongs in this section */}
                    {sec.subtitles && sec.subtitles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sec.subtitles.map((sub, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200/60"
                          >
                            • {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">
                    Apartado {sec.number}
                  </span>
                </div>

                {/* Content Area (Blank unless user filled it in Edit Mode) */}
                {sec.content && sec.content.trim() !== '' ? (
                  <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                    {sec.content}
                  </p>
                ) : (
                  <div className="py-6 px-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/50 text-center">
                    <p className="text-xs font-mono text-stone-400">
                      [ Información en blanco — Pendiente de redactar este apartado ]
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RECURSOS Y EVIDENCIAS (EN BLANCO) */}
      {activeTab === 'recursos' && (
        <div className="animate-fadeIn">
          {module.resources.length > 0 || module.notes.length > 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 space-y-4">
              {module.resources.map((res) => (
                <div key={res.id} className="py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900">{res.title}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-800 underline"
                  >
                    Abrir
                  </a>
                </div>
              ))}
              {module.notes.map((n, i) => (
                <p key={i} className="text-xs text-stone-600">{n}</p>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-400 space-y-2 border border-dashed border-stone-200 rounded-2xl bg-white/50">
              <FileText className="w-6 h-6 text-stone-300 mx-auto" />
              <p className="text-xs font-mono text-stone-400">Apartado en blanco</p>
              <p className="text-xs text-stone-500">
                Aún no se han integrado evidencias o recursos adicionales.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Footer Stepper */}
      <div className="flex items-center justify-between pt-6 border-t border-stone-200/80 text-xs">
        {prevModule ? (
          <button
            onClick={() => onSelectModule(prevModule)}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior: {prevModule.title}</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={onBackToSemester}
          className="text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
        >
          Ver todos los equipos
        </button>

        {nextModule ? (
          <button
            onClick={() => onSelectModule(nextModule)}
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
          >
            <span>Siguiente: {nextModule.title}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
