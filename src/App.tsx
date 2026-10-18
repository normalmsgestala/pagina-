/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_CURRICULUM, STORAGE_KEY } from './data/defaultCurriculum';
import { Semester, ModuleItem, EmergentTechTeamVideo } from './types/curriculum';
import { SemesterView } from './components/SemesterView';
import { ModuleDetailView } from './components/ModuleDetailView';
import { EditModuleModal } from './components/EditModuleModal';
import { AddModuleModal } from './components/AddModuleModal';
import { CalendarSection } from './components/CalendarSection';
import { ChevronRight } from 'lucide-react';

export default function App() {
  // Curriculum state persisted in localStorage
  const [curriculum, setCurriculum] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved curriculum:', e);
    }
    return INITIAL_CURRICULUM;
  });

  // Navigation state:
  // view: 'home' | 'semester' | 'module'
  const [view, setView] = useState<'home' | 'semester' | 'module'>('home');
  const [activeSemesterNum, setActiveSemesterNum] = useState<number>(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Edit mode and modal states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [moduleToEdit, setModuleToEdit] = useState<ModuleItem | null>(null);
  const [isAddingModule, setIsAddingModule] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculum));
    } catch (e) {
      console.error('Error saving curriculum:', e);
    }
  }, [curriculum]);

  // Current active semester
  const currentSemester = curriculum.find((s) => s.number === activeSemesterNum) || curriculum[0];

  // Current selected module / project
  const selectedModule = currentSemester.modules.find((m) => m.id === selectedModuleId) || null;

  // Navigation handlers
  const goToHome = () => {
    setView('home');
    setSelectedModuleId(null);
  };

  const goToSemester = (semNum: number) => {
    setActiveSemesterNum(semNum);
    setSelectedModuleId(null);
    setView('semester');
  };

  const goToModule = (modId: string, semNum?: number) => {
    if (semNum !== undefined) setActiveSemesterNum(semNum);
    setSelectedModuleId(modId);
    setView('module');
  };

  // Content updates
  const handleUpdateModule = (updated: ModuleItem) => {
    setCurriculum((prev) =>
      prev.map((sem) => {
        if (sem.number !== updated.semesterNumber) return sem;
        return {
          ...sem,
          modules: sem.modules.map((m) => (m.id === updated.id ? updated : m))
        };
      })
    );
  };

  const handleAddNewModule = (newMod: ModuleItem) => {
    setCurriculum((prev) =>
      prev.map((sem) => {
        if (sem.number !== newMod.semesterNumber) return sem;
        return {
          ...sem,
          modules: [...sem.modules, newMod]
        };
      })
    );
  };

  const handleUpdateEmergentVideo = (updatedVideo: EmergentTechTeamVideo) => {
    setCurriculum((prev) =>
      prev.map((sem) => {
        if (sem.number !== 1) return sem;
        return {
          ...sem,
          emergentTechVideos: (sem.emergentTechVideos || []).map((v) =>
            v.id === updatedVideo.id ? updatedVideo : v
          ),
        };
      })
    );
  };

  const handleImportCurriculum = (imported: Semester[]) => {
    setCurriculum(imported);
    goToHome();
  };

  const handleResetCurriculum = () => {
    setCurriculum(INITIAL_CURRICULUM);
    goToHome();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased">
      {/* Top Bar (Minimalist 3-zone contract) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Wordmark */}
          <button
            onClick={goToHome}
            className="text-left cursor-pointer focus:outline-hidden"
          >
            <span className="text-sm sm:text-base font-bold text-stone-900 font-display hover:text-amber-900 transition-colors">
              Campus Circus LEAF
            </span>
          </button>

          {/* Clean Navigation Links */}
          <nav className="flex items-center gap-4 text-xs font-medium text-stone-600">
            <button
              onClick={goToHome}
              className={`hover:text-stone-900 transition-colors cursor-pointer ${
                view === 'home' ? 'text-amber-800 font-bold' : ''
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => goToSemester(1)}
              className={`hover:text-stone-900 transition-colors cursor-pointer ${
                view === 'semester' && activeSemesterNum === 1 ? 'text-amber-800 font-bold' : ''
              }`}
            >
              1° Semestre
            </button>

            <a href="/pagina-/?blog=1" className="hidden md:inline-flex items-center gap-1 text-xs text-stone-600 hover:text-amber-800">Blog LEAF ↗</a>
          </nav>

        </div>
      </header>

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* VIEW 1: HOME (Pure Licenciatura, Pure Description, Separated by Semesters) */}
        {view === 'home' && (
          <div className="space-y-12 animate-fadeIn max-w-3xl">
            {/* Pure Institutional Header & Description */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider font-mono">
                Generación 2026–2030 · Escuela Normal Superior «Profesor Moisés Sáenz Garza»
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 font-display tracking-tight text-balance leading-tight">
                Licenciatura en Enseñanza y Aprendizaje de la Física
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed pt-2">
                Diseñar y construir un entorno interactivo y lúdico basado en atracciones mecánicas y astronómicas, 
                transformando conceptos abstractos de la física en experiencias de aprendizaje activo para la formación docente 
                en la Escuela Normal Superior. La articulación de mecánica, álgebra, tecnologías y didáctica garantiza el 
                desarrollo de competencias pedagógicas innovadoras para la enseñanza en educación básica.
              </p>
            </div>

            {/* Separated by Semesters */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-stone-800 uppercase tracking-wider font-mono">
                  Organización por Semestres
                </span>
                <span>Selecciona un semestre</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curriculum.map((sem) => {
                  const isFirst = sem.number === 1;

                  return (
                    <div
                      key={sem.number}
                      onClick={() => goToSemester(sem.number)}
                      className={`group circus-project-card p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isFirst
                          ? 'border-amber-300 ring-1 ring-amber-200 hover:border-amber-500 hover:shadow-xs'
                          : 'border-stone-200/80 hover:border-stone-400/80 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-400">
                              0{sem.number}
                            </span>
                            <h2
                              className={`text-base font-bold font-display ${
                                isFirst
                                  ? 'text-stone-900 group-hover:text-amber-900'
                                  : 'text-stone-700 group-hover:text-stone-900'
                              } transition-colors`}
                            >
                              {sem.name}
                            </h2>
                          </div>

                          {isFirst ? (
                            <span className="text-xs font-semibold text-amber-800 block pt-1">
                              Parque Temático de la Física
                            </span>
                          ) : null}
                        </div>

                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 group-hover:text-stone-900 transition-all shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <CalendarSection />
          </div>
        )}

        {/* VIEW 2: SEMESTER (5 Projects + Tecnologías Emergentes for Semester 1; Blank for 2-8) */}
        {view === 'semester' && (
          <SemesterView
            semester={currentSemester}
            onBackToHome={goToHome}
            onSelectModule={(mod) => goToModule(mod.id)}
            onAddNewModule={() => setIsAddingModule(true)}
            onEditModule={(mod) => setModuleToEdit(mod)}
            onUpdateEmergentVideo={handleUpdateEmergentVideo}
            isEditMode={isEditMode}
          />
        )}

        {/* VIEW 3: PROJECT DETAIL */}
        {view === 'module' && selectedModule && (
          <ModuleDetailView
            module={selectedModule}
            semesterName={currentSemester.name}
            allSemesterModules={currentSemester.modules}
            onBackToSemester={() => setView('semester')}
            onSelectModule={(mod) => setSelectedModuleId(mod.id)}
            onEditModule={(mod) => setModuleToEdit(mod)}
            isEditMode={isEditMode}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-stone-200 mt-auto py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <strong className="text-stone-800 font-semibold block">
              Escuela Normal Superior «Profesor Moisés Sáenz Garza»
            </strong>
            <p className="text-stone-500">
              Generación 2026–2030 · Licenciatura en Enseñanza y Aprendizaje de la Física
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-400">
            <button onClick={goToHome} className="hover:text-stone-700 transition cursor-pointer">
              Inicio
            </button>
            <span>·</span>
            <button onClick={() => goToSemester(1)} className="hover:text-stone-700 transition cursor-pointer">
              1° Semestre
            </button>
            <span>·</span>

          </div>
        </div>
      </footer>

      {/* Modals */}
      {moduleToEdit && (
        <EditModuleModal
          module={moduleToEdit}
          isOpen={!!moduleToEdit}
          onClose={() => setModuleToEdit(null)}
          onSave={handleUpdateModule}
        />
      )}

      {isAddingModule && (
        <AddModuleModal
          semesterNumber={activeSemesterNum}
          existingCount={currentSemester.modules.length}
          isOpen={isAddingModule}
          onClose={() => setIsAddingModule(false)}
          onAdd={handleAddNewModule}
        />
      )}


    </div>
  );
}
