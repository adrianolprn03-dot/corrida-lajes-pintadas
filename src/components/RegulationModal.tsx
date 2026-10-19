import React, { useState } from 'react';
import { X, FileText, Shield, Download, Printer } from 'lucide-react';
import { EventSettings } from '../types';

interface RegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EventSettings;
  initialTab?: 'terms' | 'privacy';
}

export const RegulationModal: React.FC<RegulationModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider">
                Documentos Oficiais do Evento
              </h3>
              <p className="text-xs text-orange-100">
                5ª Corrida de Emancipação Política de Lajes Pintadas/RN (2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Imprimir Documento"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'terms'
                ? 'bg-white text-orange-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Regulamento Geral da Corrida</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'privacy'
                ? 'bg-white text-orange-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Política de Privacidade (LGPD)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-950 font-medium">
                <p>
                  <strong>Data da Prova:</strong> 26 de dezembro de 2026 (Sábado) • <strong>Largada:</strong> {settings.startTime}h
                </p>
                <p>
                  <strong>Percurso:</strong> {settings.distanceKm} km • <strong>Local:</strong> {settings.startLocation}
                </p>
                <p>
                  <strong>Inscrição:</strong> R$ 60,00 (+ taxas de gateway Asaas) com direito à Camisa Oficial Laranja.
                </p>
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {settings.termsContent}
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 uppercase mb-1">Regras de Menores de Idade</h4>
                <p className="text-slate-600">{settings.minorRules}</p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 uppercase mb-1">Política de Cancelamento e Reembolso</h4>
                <p className="text-slate-600">{settings.cancellationPolicy}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950 font-medium">
                Em conformidade com a Lei Federal nº 13.709/2018 (LGPD), seus dados pessoais são coletados com finalidade estrita de identificação na prova esportiva e nunca serão expostos publicamente.
              </div>

              <div className="whitespace-pre-line font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {settings.privacyContent}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Prefeitura Municipal de Lajes Pintadas/RN • Secretaria de Esportes
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            Fechar Regulamento
          </button>
        </div>
      </div>
    </div>
  );
};
