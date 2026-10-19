import React from 'react';
import { X, Check } from 'lucide-react';
import { Step1AthleteData, Step1Data } from './Step1AthleteData';
import { Step2CategoryAndShirt, Step2Data } from './Step2CategoryAndShirt';
import { Step3ReviewAndPayment } from './Step3ReviewAndPayment';
import {
  EventSettings,
  ShirtInventoryItem,
  Registration,
  ShirtSize,
} from '../../types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EventSettings;
  inventory: ShirtInventoryItem[];
  onSubmitRegistration: (data: any) => Promise<{
    registration: Registration;
    accessCode: string;
  }>;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  initialShirtSize?: ShirtSize;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  settings,
  inventory,
  onSubmitRegistration,
  onOpenTerms,
  onOpenPrivacy,
  initialShirtSize,
}) => {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  const [step1Data, setStep1Data] = React.useState<Step1Data>({
    fullName: '',
    cpf: '',
    birthDate: '',
    email: '',
    phone: '',
    city: '',
    state: 'RN',
    team: '',
  });

  const [step2Data, setStep2Data] = React.useState<Step2Data>({
    originType: 'CASA',
    gender: 'MASCULINO',
    casaProofType: 'NATURAL_E_RESIDENTE',
    shirtSize: initialShirtSize || 'M',
    paymentMethod: 'PIX',
  });

  if (!isOpen) return null;

  const handleStep1Change = (fields: Partial<Step1Data>) => {
    setStep1Data((prev) => ({ ...prev, ...fields }));
  };

  const handleStep2Change = (fields: Partial<Step2Data>) => {
    setStep2Data((prev) => ({ ...prev, ...fields }));
  };

  const handleFinalSubmit = async (agreements: { termsAccepted: boolean; privacyAccepted: boolean }) => {
    return onSubmitRegistration({
      ...step1Data,
      ...step2Data,
      termsAccepted: agreements.termsAccepted,
      privacyAccepted: agreements.privacyAccepted,
      termsVersion: settings.termsVersion,
      privacyVersion: settings.privacyVersion,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/brasao_lajes.png"
              alt="Brasão Lajes Pintadas"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                Inscrição Oficial • 5 KM
              </span>
              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase leading-tight">
                5ª Corrida de Emancipação
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 1
                    ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {currentStep > 1 ? <Check size={14} /> : '1'}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${currentStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                Dados
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 2
                    ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {currentStep > 2 ? <Check size={14} /> : '2'}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${currentStep === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                Categoria & Camisa
              </span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                3
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${currentStep === 3 ? 'text-slate-900' : 'text-slate-500'}`}>
                Pagamento
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 1 && (
            <Step1AthleteData
              data={step1Data}
              onChange={handleStep1Change}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2CategoryAndShirt
              data={step2Data}
              city={step1Data.city}
              state={step1Data.state}
              inventory={inventory}
              settings={settings}
              onChange={handleStep2Change}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <Step3ReviewAndPayment
              step1={step1Data}
              step2={step2Data}
              settings={settings}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleFinalSubmit}
              onOpenTerms={onOpenTerms}
              onOpenPrivacy={onOpenPrivacy}
              onFinish={onClose}
            />
          )}
        </div>

      </div>
    </div>
  );
};
