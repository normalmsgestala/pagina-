import React, { useState } from 'react';
import { CircusProjectIntro } from './CircusProjectIntro';
import { Semester, ModuleItem, EmergentTechTeamVideo } from '../types/curriculum';
import { 
  ArrowLeft, 
  Compass, 
  Edit3, 
  ChevronRight,
  Video,
  Layers
} from 'lucide-react';

interface SemesterViewProps {
  semester: Semester;
  onBackToHome: () => void;
  onSelectModule: (mod: ModuleItem) => void;
  onAddNewModule: () => void;
  onEditModule: (mod: ModuleItem) => void;
  onUpdateEmergentVideo?: (video: EmergentTechTeamVideo) => void;
  isEditMode: boolean;
}

export const SemesterView: React.FC<SemesterViewProps> = ({
  semester,
  onBackToHome,
  onSelectModule,
  onEditModule,
  onUpdateEmergentVideo,
  isEditMode
}) => {
  const [activeSection, setActiveSection] = useState<'proyectos' | 'tecnologias'>('proyectos');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [tempVideoUrl, setTempVideoUrl] = useState<string>('');
  const [tempVideoTitle, setTempVideoTitle] = useState<string>('');

  const isFirstSemester = semester.number === 1;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/70">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-stone-500" />
          <span>Volver a Inicio</span>
        </button>

        <span className="text-xs font-mono text-stone-400">
          {semester.name}
        </span>
      </div>

      {/* Semester Header */}
      {semester.modules.length === 0 ? (
        /* Blank State for Semesters 2 to 8 */
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-stone-900 font-display tracking-tight">
            {semester.name}
          </h2>
          <div className="py-20 text-center text-stone-400 space-y-2 border border-dashed border-stone-200 rounded-2xl bg-white/50">
            <p className="text-xs font-mono text-stone-400">Visualización de Semestre</p>
            <p className="text-xs text-stone-500">En blanco — Sin contenido integrado aún.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Project Integrator Header for 1st Semester */}
          {isFirstSemester && <CircusProjectIntro />}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <span className="font-mono font-bold text-amber-800 uppercase tracking-wider">
                {semester.name} · Proyecto Integrador
              </span>
              <div className="flex flex-wrap items-center gap-2 text-stone-500">
                {semester.articulatedSubjects?.map((subj, i) => (
                  <React.Fragment key={subj}>
                    {i > 0 && <span>·</span>}
                    <span className="font-medium text-stone-700">{subj}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display tracking-tight text-balance">
              {semester.projectIntegratorTitle || semester.name}
            </h2>

            {semester.projectIntegratorPurpose && (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Propósito General del Proyecto Integrador:
                </span>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                  {semester.projectIntegratorPurpose}
                </p>
              </div>
            )}
          </div>

          {/* Section Switcher inside 1st Semester: 1. Proyectos del Parque Temático | 2. Tecnologías Emergentes */}
          {isFirstSemester && (
            <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
              <button
                onClick={() => setActiveSection('proyectos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === 'proyectos'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Proyectos por Equipo</span>
              </button>

              <button
                onClick={() => setActiveSection('tecnologias')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSection === 'tecnologias'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Tecnologías Emergentes (Videos por Equipos)</span>
              </button>
            </div>
          )}

          {/* SECTION A: THE 5 PROJECTS OF PARQUE TEMÁTICO */}
          {activeSection === 'proyectos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Equipos del Parque Temático ({semester.modules.length})
                </span>
                <span className="text-xs text-stone-400">
                  Selecciona un equipo para abrir su simulador interactivo y los títulos de sus apartados
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {semester.modules.map((mod) => {
                  const hasSim = mod.simulatorConfig && mod.simulatorConfig.type !== 'none';

                  return (
                    <div
                      key={mod.id}
                      onClick={() => onSelectModule(mod)}
                      className="group p-6 rounded-2xl border border-stone-200/90 hover:border-amber-500 bg-white transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                              {mod.teamName}
                            </span>
                            <span>·</span>
                            <span className="text-stone-500">{mod.category}</span>
                            {hasSim && (
                              <>
                                <span>·</span>
                                <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Compass className="w-3 h-3 text-amber-600" />
                                  Simulador Interactivo Integrado
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span className="text-stone-400 font-mono text-[11px]">
                              Apartados del proyecto
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-display group-hover:text-amber-900 transition-colors">
                            {mod.title}
                          </h3>

                          {/* Summary preview of Propósitos por Materia */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-stone-600">
                            <div>
                              <strong className="text-stone-800">Mecánica: </strong>
                              <span>{mod.subjectPurposes.mecanica}</span>
                            </div>
                            <div>
                              <strong className="text-stone-800">Álgebra: </strong>
                              <span>{mod.subjectPurposes.algebra}</span>
                            </div>
                            <div>
                              <strong className="text-stone-800">Tecnologías: </strong>
                              <span>{mod.subjectPurposes.tecnologias}</span>
                            </div>
                            <div>
                              <strong className="text-stone-800">Didáctica: </strong>
                              <span>{mod.subjectPurposes.didactica}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 group-hover:text-amber-800">
                            <span>Abrir {mod.teamName}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>

                          {isEditMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditModule(mod);
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B: TECNOLOGÍAS EMERGENTES (VIDEOS POR EQUIPOS - EN BLANCO) */}
          {false && activeSection === 'tecnologias' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
                  <Video className="w-4 h-4" />
                  <span>Apartado de Tecnologías Emergentes</span>
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-display">
                  Videos Documentales y Experimentales por Equipos
                </h3>
                <p className="text-xs text-stone-500">
                  Espacio reservado para la integración de videos de cada equipo. Actualmente en blanco.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(semester.emergentTechVideos || []).map((vid) => {
                  const isEditingThis = editingVideoId === vid.id;

                  return (
                    <div
                      key={vid.id}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-stone-500 uppercase">
                            {vid.teamName}
                          </span>
                          <h4 className="text-base font-bold text-stone-900 font-display">
                            {vid.projectTitle}
                          </h4>
                        </div>

                        {isEditMode && onUpdateEmergentVideo && (
                          <button
                            onClick={() => {
                              if (isEditingThis) {
                                setEditingVideoId(null);
                              } else {
                                setEditingVideoId(vid.id);
                                setTempVideoUrl(vid.videoUrl);
                                setTempVideoTitle(vid.videoTitle);
                              }
                            }}
                            className="text-xs text-amber-700 hover:underline font-medium flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingThis ? 'Cancelar' : 'Integrar Video'}</span>
                          </button>
                        )}
                      </div>

                      {isEditingThis && onUpdateEmergentVideo ? (
                        <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                          <input
                            type="text"
                            placeholder="Título del video..."
                            value={tempVideoTitle}
                            onChange={(e) => setTempVideoTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            type="url"
                            placeholder="URL del video (YouTube o MP4)..."
                            value={tempVideoUrl}
                            onChange={(e) => setTempVideoUrl(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-mono text-[11px]"
                          />
                          <button
                            onClick={() => {
                              onUpdateEmergentVideo({
                                ...vid,
                                videoTitle: tempVideoTitle.trim(),
                                videoUrl: tempVideoUrl.trim(),
                              });
                              setEditingVideoId(null);
                            }}
                            className="w-full py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                          >
                            Guardar Video
                          </button>
                        </div>
                      ) : vid.videoUrl ? (
                        <div className="space-y-2">
                          {vid.videoTitle && (
                            <p className="text-xs font-medium text-stone-700">{vid.videoTitle}</p>
                          )}
                          <a
                            href={vid.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-amber-800 font-medium hover:bg-stone-100 truncate"
                          >
                            Ver Video: {vid.videoUrl}
                          </a>
                        </div>
                      ) : (
                        /* Blank Video Placeholder */
                        <div className="py-10 px-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/50 text-center space-y-1">
                          <Video className="w-5 h-5 text-stone-300 mx-auto" />
                          <p className="text-xs font-mono text-stone-400">Espacio en blanco</p>
                          <p className="text-[11px] text-stone-400">
                            Aún no se ha integrado video para el {vid.teamName}.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
