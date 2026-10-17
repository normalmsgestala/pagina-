import React, { useState } from 'react';
import { ModuleItem } from '../types/curriculum';
import { X, Plus } from 'lucide-react';

interface AddModuleModalProps {
  semesterNumber: number;
  existingCount: number;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newModule: ModuleItem) => void;
}

export const AddModuleModal: React.FC<AddModuleModalProps> = ({
  semesterNumber,
  existingCount,
  isOpen,
  onClose,
  onAdd
}) => {
  const [teamName, setTeamName] = useState(`Equipo ${existingCount + 1}`);
  const [title, setTitle] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState('Física en Movimiento');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMod: ModuleItem = {
      id: `sem${semesterNumber}-eq${Date.now()}`,
      semesterNumber,
      order: existingCount + 1,
      teamName: teamName.trim(),
      title: title.trim(),
      shortName: shortName.trim() || title.trim(),
      category: category.trim(),
      subjectPurposes: {
        mecanica: 'En blanco — pendiente de definir.',
        algebra: 'En blanco — pendiente de definir.',
        tecnologias: 'En blanco — pendiente de definir.',
        didactica: 'En blanco — pendiente de definir.',
      },
      rubric: {
        criterio: 'En blanco — pendiente de definir.',
        nivelEsperado: 'En blanco — pendiente de definir.',
      },
      guideSections: [
        {
          id: 'sec-1',
          number: '1',
          title: '1. Portada y Datos de Identificación',
          subtitles: ['Nombre del Proyecto y Equipo', 'Integrantes del Equipo y Semestre'],
          content: '',
        },
        {
          id: 'sec-2',
          number: '2',
          title: '2. Marco Teórico y Modelación Matemática',
          subtitles: ['Principios físicos', 'Ecuaciones del sistema'],
          content: '',
        },
        {
          id: 'sec-3',
          number: '3',
          title: '3. Diseño del Prototipo y Secuencia Didáctica',
          subtitles: ['Construcción del prototipo', 'Transposición didáctica'],
          content: '',
        },
      ],
      theoryContent: '',
      historyContent: '',
      simulatorConfig: {
        type: 'none',
        title: '',
        description: '',
      },
      resources: [],
      notes: [],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAdd(newMod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-5 my-8 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Agregar Nuevo Proyecto
            </h3>
            <p className="text-stone-500">Semestre {semesterNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Equipo:</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Título del Proyecto:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Equipo 6: Péndulo de Foucault"
              className="w-full px-3 py-2 rounded-lg border border-stone-300"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nombre Breve:</label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Ej. Péndulo de Foucault"
              className="w-full px-3 py-2 rounded-lg border border-stone-300"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
