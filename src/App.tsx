import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ShirtShowcase } from './components/ShirtShowcase';
import { CourseElevationSection } from './components/CourseElevationSection';
import { ScheduleSection } from './components/ScheduleSection';
import { CategoriesSection } from './components/CategoriesSection';
import { EventOverview } from './components/EventOverview';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { StickyBar } from './components/StickyBar';

// Lazy-loaded on demand to ensure an ultra-light public landing page
const RegistrationModal = lazy(() =>
  import('./components/RegistrationWizard/RegistrationModal').then((m) => ({ default: m.RegistrationModal }))
);
const AthleteArea = lazy(() =>
  import('./components/AthleteArea').then((m) => ({ default: m.AthleteArea }))
);
const RegulationModal = lazy(() =>
  import('./components/RegulationModal').then((m) => ({ default: m.RegulationModal }))
);
const AdminPanel = lazy(() =>
  import('./components/AdminPanel/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
import { storageService, INITIAL_SETTINGS, INITIAL_SHIRTS } from './services/storage';
import { EventSettings, ShirtInventoryItem, AdminMetrics, RegistrationSubmission, Registration, ShirtSize } from './types';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<EventSettings>(INITIAL_SETTINGS);
  const [shirts, setShirts] = useState<ShirtInventoryItem[]>(INITIAL_SHIRTS);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [preselectedSize, setPreselectedSize] = useState<ShirtSize | undefined>(undefined);
  const [isAthleteAreaOpen, setIsAthleteAreaOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRegulationOpen, setIsRegulationOpen] = useState(false);
  const [regulationTab, setRegulationTab] = useState<'terms' | 'privacy'>('terms');

  // Toast notification
  const [toast, setToast] = useState<{ type: 'info' | 'success' | 'warning'; message: string } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sRes, shRes, mRes] = await Promise.allSettled([
        storageService.getSettings(),
        storageService.getShirtInventory(),
        storageService.getAdminMetrics(),
      ]);

      if (sRes.status === 'fulfilled') setSettings(sRes.value);
      if (shRes.status === 'fulfilled') setShirts(shRes.value);
      if (mRes.status === 'fulfilled') setMetrics(mRes.value);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRegister = async () => {
    try {
      const freshShirts = await storageService.getShirtInventory();
      setShirts(freshShirts);
    } catch {}

    if (settings.status === 'PREPARATION') {
      showToast(
        'Inscrições em preparação! A organização está finalizando a grade oficial antes da abertura.',
        'warning'
      );
      return;
    }
    if (settings.status === 'SUSPENDED') {
      showToast('As inscrições estão temporariamente suspensas pela organização.', 'warning');
      return;
    }
    if (settings.status === 'CLOSED') {
      showToast('O período oficial de inscrições foi encerrado.', 'info');
      return;
    }
    if (settings.status === 'SOLD_OUT') {
      showToast('Vagas esgotadas para a 5ª Corrida!', 'warning');
      return;
    }

    setIsRegisterOpen(true);
  };

  const handleOpenRegulation = (tab: 'terms' | 'privacy' = 'terms') => {
    setRegulationTab(tab);
    setIsRegulationOpen(true);
  };

  const handleSubmitRegistration = async (submission: RegistrationSubmission): Promise<{
    registration: Registration;
    accessCode: string;
  }> => {
    const result = await storageService.submitRegistration(submission);
    // Reload metrics and shirt inventory immediately
    await loadData();
    return {
      registration: result.registration,
      accessCode: result.accessCode,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#101D2C] selection:bg-[#F97316] selection:text-[#101D2C] relative font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-[2px] shadow-lg flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
            toast.type === 'success' 
              ? 'bg-[#101D2C] text-white border-emerald-500' 
              : toast.type === 'warning' 
              ? 'bg-[#101D2C] text-white border-[#F97316]' 
              : 'bg-[#101D2C] text-white border-white/20'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#F97316] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Institutional Header */}
      <Header
        settings={settings}
        onOpenLookup={() => setIsAthleteAreaOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRegister={handleOpenRegister}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          settings={settings}
          onOpenRegister={handleOpenRegister}
          onOpenLookup={() => setIsAthleteAreaOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          availableCapacity={metrics?.availableCapacity}
        />

        {/* Interactive Course Map, SVG Elevation Profile & Pace Calculator */}
        <CourseElevationSection onOpenRegister={handleOpenRegister} />

        {/* Orange Shirt Presentation & Live Stock */}
        <ShirtShowcase 
          inventory={shirts} 
          onOpenRegisterWithSize={(size) => {
            setPreselectedSize(size);
            handleOpenRegister();
          }}
        />

        {/* Categories (Casa vs Visitante) & Podium Awards */}
        <CategoriesSection />

        {/* Official Race Day Morning Schedule */}
        <ScheduleSection />

        {/* Technical Logistics & Kit Pickup */}
        <EventOverview settings={settings} />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Floating Sticky Conversion Bar */}
      <StickyBar
        settings={settings}
        onOpenRegister={handleOpenRegister}
        onOpenLookup={() => setIsAthleteAreaOpen(true)}
      />

      {/* Institutional Footer & Pre-Footer CTA */}
      <Footer
        onOpenRegulation={handleOpenRegulation}
        onOpenAthleteArea={() => setIsAthleteAreaOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRegister={handleOpenRegister}
      />

      {/* Lazy Modals with Suspense for high performance */}
      <Suspense fallback={null}>
        {/* Registration Wizard Modal */}
        {isRegisterOpen && (
          <RegistrationModal
            isOpen={isRegisterOpen}
            onClose={() => {
              setIsRegisterOpen(false);
              setPreselectedSize(undefined);
              loadData();
            }}
            settings={settings}
            inventory={shirts}
            onSubmitRegistration={handleSubmitRegistration}
            onOpenTerms={() => handleOpenRegulation('terms')}
            onOpenPrivacy={() => handleOpenRegulation('privacy')}
            initialShirtSize={preselectedSize}
          />
        )}

        {/* Athlete Area Modal (Lookup, PDF Voucher, Asaas Payment continuation) */}
        {isAthleteAreaOpen && (
          <AthleteArea
            isOpen={isAthleteAreaOpen}
            onClose={() => setIsAthleteAreaOpen(false)}
          />
        )}

        {/* Regulation and Privacy Policy Modal */}
        {isRegulationOpen && (
          <RegulationModal
            isOpen={isRegulationOpen}
            onClose={() => setIsRegulationOpen(false)}
            settings={settings}
            initialTab={regulationTab}
          />
        )}

        {/* Admin Panel Modal / Dashboard */}
        {isAdminOpen && (
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => {
              setIsAdminOpen(false);
              loadData();
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
