import React, { useState } from 'react';
import { ModuleItem } from '../types/curriculum';
import { X, Save } from 'lucide-react';

interface EditModuleModalProps {
  module: ModuleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedModule: ModuleItem) => void;
}

export const EditModuleModal: React.FC<EditModuleModalProps> = ({
  module,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<ModuleItem>({
    ...module,
    guideSections: module.guideSections ? [...module.guideSections] : []
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const handleGuideSectionChange = (secId: string, field: 'title' | 'content', value: string) => {
    setFormData((prev) => ({
      ...prev,
      guideSections: (prev.guideSections || []).map((s) =>
        s.id === secId ? { ...s, [field]: value } : s
      )
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col my-8 text-xs">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Editar Proyecto ({formData.teamName})
            </h3>
            <p className="text-stone-500">
              Integra información en los apartados del proyecto, edita propósitos o actualiza la rúbrica
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Equipo:</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Título del Proyecto:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300"
                required
              />
            </div>
          </div>

          {/* Propósitos por materia */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="font-bold text-stone-800">Propósitos por Materia</h4>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mecánica:</label>
              <input
                type="text"
                value={formData.subjectPurposes.mecanica}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectPurposes: { ...formData.subjectPurposes, mecanica: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Álgebra para Física:</label>
              <input
                type="text"
                value={formData.subjectPurposes.algebra}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectPurposes: { ...formData.subjectPurposes, algebra: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tecnologías y Pedagogías Emergentes:</label>
              <input
                type="text"
                value={formData.subjectPurposes.tecnologias}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectPurposes: { ...formData.subjectPurposes, tecnologias: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Didáctica de las Ciencias Experimentales:</label>
              <input
                type="text"
                value={formData.subjectPurposes.didactica}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subjectPurposes: { ...formData.subjectPurposes, didactica: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>
          </div>

          {/* Evaluación y Rúbrica Corta */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="font-bold text-stone-800">Evaluación y Rúbrica Corta</h4>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Criterio:</label>
              <input
                type="text"
                value={formData.rubric.criterio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rubric: { ...formData.rubric, criterio: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nivel Esperado:</label>
              <input
                type="text"
                value={formData.rubric.nivelEsperado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rubric: { ...formData.rubric, nivelEsperado: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300"
              />
            </div>
          </div>

          {/* Apartados Estructurales del Proyecto */}
          {formData.guideSections && formData.guideSections.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-stone-200">
              <h4 className="font-bold text-stone-800">
                Apartados del Proyecto (Dejar vacío si aún está en blanco)
              </h4>

              {formData.guideSections.map((sec) => (
                <div key={sec.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleGuideSectionChange(sec.id, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 font-bold text-stone-900 bg-white"
                  />
                  <textarea
                    rows={2}
                    value={sec.content}
                    onChange={(e) => handleGuideSectionChange(sec.id, 'content', e.target.value)}
                    placeholder="En blanco — Escribe aquí el contenido de este apartado cuando lo tengan listo..."
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
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
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
