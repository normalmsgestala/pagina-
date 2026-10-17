import React, { useState } from 'react';
import { Semester } from '../types/curriculum';
import { X, Download, Upload, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Semester[];
  onImport: (newCurriculum: Semester[]) => void;
  onReset: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  curriculum,
  onImport,
  onReset
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(curriculum, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `curriculum_fisica_moises_saenz_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg('Archivo JSON descargado exitosamente.');
  };

  const handleImportJson = () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('El archivo debe ser un arreglo de semestres válido.');
      }
      onImport(parsed);
      setSuccessMsg('Plan de estudios actualizado correctamente desde JSON.');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg('Error al parsear el JSON: ' + (err.message || 'Estructura inválida.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-xl w-full p-6 space-y-6 my-8 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-display">
              Gestión de Datos y Respaldo
            </h3>
            <p className="text-stone-500">
              Exporta o importa el plan curricular para mantenerlo actualizado entre sesiones
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Export action */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-stone-900 block font-semibold">Descargar Respaldo JSON</strong>
              <p className="text-stone-500 text-[11px]">
                Guarda una copia de todos los módulos, guías didácticas y notas en tu computadora.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="space-y-2">
          <label className="block font-semibold text-stone-800">
            Importar o Actualizar desde JSON:
          </label>
          <textarea
            rows={4}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Pega aquí el contenido JSON exportado..."
            className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-[11px]"
          />
          <button
            onClick={handleImportJson}
            disabled={!jsonText.trim()}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Cargar y Reemplazar Plan de Estudios</span>
          </button>
        </div>

        {/* Reset to defaults */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <div>
            <strong className="text-stone-800 block">Restablecer Currículum Oficial</strong>
            <span className="text-stone-400 text-[11px]">Restaura los 5 módulos iniciales del 1er semestre y datos base.</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas restablecer todos los módulos a su estado oficial original?')) {
                onReset();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
