import React, { useState, useEffect, useRef } from 'react';
import {
  Shirt,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  X,
  Save,
  Building2,
  Globe,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  QrCode,
  Camera,
  RotateCcw,
  FileSpreadsheet,
  Hash,
  UserCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import jsQR from 'jsqr';
import * as XLSX from 'xlsx';
import { ShirtInventoryItem, ShirtSize, Registration } from '../../types';
import { formatCPF, formatDateTimeBR, formatDateBR } from '../../lib/masks';
import { storageService } from '../../services/storage';
import {
  parseKitQrPayload,
  extractBibNumber,
  extractDeliveryNote,
  calculateAthleteAge,
  playFeedbackBeep,
} from '../../lib/kitQr';

function normalizeSearchText(str?: string | null): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

interface AdminShirtsAndKitsProps {
  shirts: ShirtInventoryItem[];
  registrations: Registration[];
  onUpdateStock: (size: ShirtSize, newStock: number) => Promise<void>;
  onDeliverKit: (registrationId: string, deliveredBy: string, notes?: string, bibNumber?: string) => Promise<void>;
  onRefresh: () => void;
  defaultOperatorName?: string;
}

export const AdminShirtsAndKits: React.FC<AdminShirtsAndKitsProps> = ({
  shirts,
  registrations,
  onDeliverKit,
  onRefresh,
  defaultOperatorName,
}) => {
  // Active Stock Tab: 'local' | 'visitor' | 'total'
  const [stockView, setStockView] = useState<'local' | 'visitor' | 'total'>('total');

  // Stock messages & reconcile state
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockSuccess, setStockSuccess] = useState<string | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  // Batch stock edit state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchStocks, setBatchStocks] = useState<Record<string, number>>({});
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Kit delivery station state
  const [kitSearch, setKitSearch] = useState('');
  const [queueFilterStatus, setQueueFilterStatus] = useState<'PENDING' | 'DELIVERED' | 'ALL_CONFIRMED'>('PENDING');
  const [queueFilterSize, setQueueFilterSize] = useState<ShirtSize | 'ALL'>('ALL');
  const [selectedAthleteForKit, setSelectedAthleteForKit] = useState<Registration | null>(null);
  const [operatorName, setOperatorName] = useState(defaultOperatorName || 'Comissão Organizadora - Mesa 1');
  const [bibNumber, setBibNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [isUndoingDelivery, setIsUndoingDelivery] = useState(false);
  const [autoOpenNextScan, setAutoOpenNextScan] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // QR Code Camera Scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Unpack PCD metadata helper
  const enrichAthleteRegistration = (reg: Registration): Registration => {
    let enriched = { ...reg };
    if (enriched.kitNotes && typeof enriched.kitNotes === 'string') {
      const matchPcd = enriched.kitNotes.match(/PCD_META:(\{.*?\})/);
      if (matchPcd) {
        try {
          const pcdMeta = JSON.parse(matchPcd[1]);
          enriched = {
            ...enriched,
            isPcd: pcdMeta.isPcd,
            pcdType: pcdMeta.pcdType,
            pcdCid: pcdMeta.pcdCid,
            hasGuide: pcdMeta.hasGuide,
            guideName: pcdMeta.guideName,
            guideCpf: pcdMeta.guideCpf,
            guidePhone: pcdMeta.guidePhone,
            guideShirtSize: pcdMeta.guideShirtSize,
          };
        } catch {}
      }
    }
    return enriched;
  };

  const handleSelectAthleteForKit = (reg: Registration) => {
    const enriched = enrichAthleteRegistration(reg);
    setSelectedAthleteForKit(enriched);
    setBibNumber(extractBibNumber(enriched.kitNotes) || '');
    setDeliveryNotes(extractDeliveryNote(enriched.kitNotes) || '');
  };

  // Stop camera helper
  const stopScanner = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  // Process decoded QR payload or search scan
  const handleDecodedQrCode = async (rawValue: string) => {
    const parsed = parseKitQrPayload(rawValue);
    const targetProto = parsed.protocol;
    const cleanTerm = parsed.rawTerm.toLowerCase();
    const cleanDigits = cleanTerm.replace(/\D/g, '');

    let found = registrations.find((r) => {
      if (targetProto && r.protocol.toUpperCase() === targetProto) return true;
      if (r.protocol.toLowerCase() === cleanTerm) return true;
      if (cleanDigits.length === 11 && r.athlete?.cpf?.replace(/\D/g, '') === cleanDigits) return true;
      return false;
    });

    if (!found && targetProto) {
      try {
        const remoteReg = await storageService.getRegistrationByProtocol(targetProto);
        if (remoteReg) found = remoteReg;
      } catch {}
    }

    if (found) {
      stopScanner();
      handleSelectAthleteForKit(found);
      setKitSearch(found.protocol);
      if (found.kitDelivered) {
        playFeedbackBeep('error');
        setDeliveryMessage({
          type: 'error',
          text: `ATENÇÃO: O kit do protocolo ${found.protocol} (${found.athlete?.fullName}) JÁ FOI ENTREGUE em ${formatDateTimeBR(found.kitDeliveredAt)} por ${found.kitDeliveredBy || 'Atendente'}!`,
        });
      } else if (found.status !== 'CONFIRMED') {
        playFeedbackBeep('error');
        setDeliveryMessage({
          type: 'error',
          text: `ATENÇÃO: Inscrição ${found.protocol} está com status "${found.status}" (Pagamento não confirmado).`,
        });
      } else {
        playFeedbackBeep('scan');
        setDeliveryMessage({
          type: 'success',
          text: `QR Code lido com sucesso! Atleta ${found.athlete?.fullName} localizado — Camisa Tamanho ${found.shirtSize}.`,
        });
      }
    } else {
      playFeedbackBeep('error');
      setScannerError(`Nenhuma inscrição encontrada para o código lido: "${rawValue.slice(0, 40)}"`);
    }
  };

  // Start Camera QR Scanner
  useEffect(() => {
    if (!isScannerOpen) return;
    let active = true;
    setScannerError(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setScannerError('Seu navegador não suporta acesso direto à câmera. Use um navegador atualizado (Chrome/Safari) ou digite o protocolo.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play().catch(() => {});
        }

        const scanTick = () => {
          if (!active) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (width > 0 && height > 0) {
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const imgData = ctx.getImageData(0, 0, width, height);
                const code = jsQR(imgData.data, imgData.width, imgData.height, {
                  inversionAttempts: 'dontInvert',
                });
                if (code && code.data && code.data.trim()) {
                  handleDecodedQrCode(code.data.trim());
                  return;
                }
              }
            }
          }
          animFrameRef.current = requestAnimationFrame(scanTick);
        };

        animFrameRef.current = requestAnimationFrame(scanTick);
      } catch (err: any) {
        setScannerError(
          'Não foi possível acessar a câmera. Permita o uso da câmera no navegador ou digite o protocolo/CPF manualmente.'
        );
      }
    };

    startCamera();

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isScannerOpen, cameraFacing]);

  // Filtered registrations for search & queue
  const searchResults = React.useMemo(() => {
    const parsed = parseKitQrPayload(kitSearch);
    const rawTerm = (parsed.protocol || parsed.rawTerm).trim();
    const normTerm = normalizeSearchText(rawTerm);
    const cleanCpf = rawTerm.replace(/\D/g, '');
    const searchWords = normTerm.split(/\s+/).filter(Boolean);

    return registrations.filter((reg) => {
      // Queue status filter when search is empty
      if (!normTerm) {
        if (queueFilterStatus === 'PENDING' && (reg.status !== 'CONFIRMED' || reg.kitDelivered)) return false;
        if (queueFilterStatus === 'DELIVERED' && !reg.kitDelivered) return false;
        if (queueFilterStatus === 'ALL_CONFIRMED' && reg.status !== 'CONFIRMED') return false;
        if (queueFilterSize !== 'ALL' && reg.shirtSize !== queueFilterSize) return false;
        return true;
      }

      const normProtocol = normalizeSearchText(reg.protocol);
      const normName = normalizeSearchText(reg.athlete?.fullName);
      const rawCpf = (reg.athlete?.cpf || '').replace(/\D/g, '');
      const bibNumber = extractBibNumber(reg.kitNotes);
      const normBib = bibNumber ? normalizeSearchText(bibNumber) : '';

      const matchProtocol = normProtocol.includes(normTerm);
      const matchName = searchWords.length > 0 && searchWords.every((word) => normName.includes(word));
      const matchCpf = cleanCpf.length >= 2 && rawCpf.includes(cleanCpf);
      const matchBib = normBib ? normBib.includes(normTerm) : false;

      return Boolean(matchProtocol || matchName || matchCpf || matchBib);
    });
  }, [registrations, kitSearch, queueFilterStatus, queueFilterSize]);

  // If user pastes/scans a full LP5-KIT:... payload into the search box, auto-select it
  const handleSearchInputChange = (val: string) => {
    setKitSearch(val);
    if (val.toUpperCase().startsWith('LP5-KIT:')) {
      handleDecodedQrCode(val);
    }
  };

  const handleReconcileStock = async () => {
    try {
      setIsReconciling(true);
      setStockError(null);
      const res = await storageService.reconcileShirtStock();
      setStockSuccess(res.message);
      setTimeout(() => setStockSuccess(null), 6000);
      onRefresh();
    } catch (err: any) {
      setStockError(err.message || 'Falha ao sincronizar estoque real.');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleSaveBatchModal = async () => {
    try {
      setIsSavingBatch(true);
      setStockError(null);
      const items = shirts.map((s) => ({
        size: s.size,
        totalStock: Number(batchStocks[s.size] !== undefined ? batchStocks[s.size] : s.totalStock),
      }));

      for (const item of items) {
        const cur = shirts.find((s) => s.size === item.size);
        if (cur) {
          const min = (cur.reservedCount || 0) + (cur.confirmedCount || 0);
          if (item.totalStock < min) {
            throw new Error(`Tamanho ${item.size}: estoque total (${item.totalStock}) não pode ser menor que o já comprometido (${min}).`);
          }
        }
      }

      await storageService.batchUpdateShirtStock(items);
      setIsBatchModalOpen(false);
      setStockSuccess('Grade de estoque completa atualizada no banco de dados com sucesso!');
      setTimeout(() => setStockSuccess(null), 6000);
      onRefresh();
    } catch (err: any) {
      setStockError(err.message || 'Erro ao salvar estoque em lote.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleConfirmDelivery = async (e?: React.FormEvent, targetReg?: Registration) => {
    if (e) e.preventDefault();
    const athleteReg = targetReg || selectedAthleteForKit;
    if (!athleteReg) return;

    if (athleteReg.status !== 'CONFIRMED') {
      playFeedbackBeep('error');
      setDeliveryMessage({
        type: 'error',
        text: 'Não é possível entregar o kit. A inscrição deve estar CONFIRMADA (paga).',
      });
      return;
    }

    if (athleteReg.kitDelivered) {
      playFeedbackBeep('error');
      setDeliveryMessage({
        type: 'error',
        text: `Kit já entregue em ${formatDateTimeBR(athleteReg.kitDeliveredAt)} por ${athleteReg.kitDeliveredBy}. Entrega duplicada bloqueada!`,
      });
      return;
    }

    try {
      setIsSubmittingDelivery(true);
      const useBib = targetReg ? undefined : bibNumber.trim() || undefined;
      const useNotes = targetReg ? undefined : deliveryNotes.trim() || undefined;
      await onDeliverKit(athleteReg.id, operatorName.trim() || 'Mesa Oficial', useNotes, useBib);
      playFeedbackBeep('success');
      setDeliveryMessage({
        type: 'success',
        text: `✅ Kit entregue com sucesso para ${athleteReg.athlete?.fullName} — Camisa Tam. ${athleteReg.shirtSize}${useBib ? ` • Peito Nº ${useBib}` : ''}!`,
      });
      setSelectedAthleteForKit(null);
      setKitSearch('');
      setBibNumber('');
      setDeliveryNotes('');
      onRefresh();

      if (autoOpenNextScan) {
        setTimeout(() => setIsScannerOpen(true), 450);
      }
    } catch (e: any) {
      playFeedbackBeep('error');
      setDeliveryMessage({ type: 'error', text: e.message || 'Erro ao registrar entrega.' });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const handleUndoDelivery = async (reg: Registration) => {
    if (!window.confirm(`Deseja realmente ESTORNAR a baixa do kit de ${reg.athlete?.fullName} (${reg.protocol})? O kit voltará para o status Pendente.`)) {
      return;
    }
    try {
      setIsUndoingDelivery(true);
      await storageService.undoDeliverKit(reg.id);
      setDeliveryMessage({
        type: 'success',
        text: `Baixa do kit de ${reg.athlete?.fullName} (${reg.protocol}) foi estornada. Status voltou para Pendente de Retirada.`,
      });
      setSelectedAthleteForKit((prev) =>
        prev && prev.id === reg.id
          ? { ...prev, kitDelivered: false, kitDeliveredAt: undefined, kitDeliveredBy: undefined }
          : prev
      );
      onRefresh();
    } catch (err: any) {
      setDeliveryMessage({
        type: 'error',
        text: err.message || 'Não foi possível estornar a baixa do kit.',
      });
    } finally {
      setIsUndoingDelivery(false);
    }
  };

  // Exportar Folha de Assinatura Presencial (Excel)
  const handleExportKitChecklistExcel = () => {
    const confirmedRegs = registrations
      .filter((r) => r.status === 'CONFIRMED')
      .sort((a, b) => (a.athlete?.fullName || '').localeCompare(b.athlete?.fullName || ''));

    const rows = confirmedRegs.map((r, idx) => {
      const enriched = enrichAthleteRegistration(r);
      const age = calculateAthleteAge(r.athlete?.birthDate);
      return {
        'Nº': idx + 1,
        'Nome Completo do Atleta': r.athlete?.fullName || '',
        'CPF': formatCPF(r.athlete?.cpf || ''),
        'Idade': age !== null ? `${age} anos${age < 18 ? ' (MENOR)' : ''}` : '',
        'Protocolo': r.protocol,
        'Categoria': r.category.replace(/_/g, ' '),
        'Tamanho Camisa': r.shirtSize,
        'Camisa Guia (PCD)': enriched.hasGuide ? enriched.guideShirtSize || 'M' : '-',
        'Nº de Peito': extractBibNumber(r.kitNotes) || '',
        'Situação do Kit': r.kitDelivered ? 'ENTREGUE' : 'PENDENTE',
        'Entregue Em': r.kitDeliveredAt ? formatDateTimeBR(r.kitDeliveredAt) : '',
        'Atendente': r.kitDeliveredBy || '',
        'Assinatura do Atleta (Contingência)': '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Checklist Entrega de Kits');
    XLSX.writeFile(wb, `Lista_Entrega_Kits_Lajes_Pintadas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Recent deliveries list
  const recentDeliveries = registrations
    .filter((r) => r.kitDelivered)
    .sort((a, b) => new Date(b.kitDeliveredAt || '').getTime() - new Date(a.kitDeliveredAt || '').getTime())
    .slice(0, 9);

  const totalConfirmedKits = registrations.filter((r) => r.status === 'CONFIRMED').length;
  const totalDeliveredKits = registrations.filter((r) => r.status === 'CONFIRMED' && r.kitDelivered).length;
  const totalPendingKits = Math.max(0, totalConfirmedKits - totalDeliveredKits);
  const deliveryProgressPct = totalConfirmedKits > 0 ? Math.round((totalDeliveredKits / totalConfirmedKits) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION 1: Estação de Check-in Rápido por QR Code & Entrega de Kits */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Estação de Check-in e Entrega de Kits (QR Code & Baixa Rápida)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                  Anti-Duplicidade Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sede da Prefeitura (Rua São Francisco, 275) • Escaneie o QR Code do celular/impresso do atleta ou pesquise por CPF, Nome ou Protocolo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => (isScannerOpen ? stopScanner() : setIsScannerOpen(true))}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer ${
                isScannerOpen
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isScannerOpen ? 'Fechar Câmera QR Code' : '📷 Ler QR Code do Atleta'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportKitChecklistExcel}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              title="Exportar planilha em ordem alfabética para conferência e assinatura presencial"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Folha de Assinatura (Excel)</span>
            </button>
          </div>
        </div>

        {/* Barra de Progresso Ao Vivo da Entrega de Kits */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-orange-400" />
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Progresso da Entrega de Kits (Inscrições Confirmadas):
              </span>
            </div>
            <div className="flex items-center gap-4 font-bold">
              <span className="text-emerald-400">✅ Entregues: {totalDeliveredKits}</span>
              <span className="text-amber-300">⏳ Faltam Retirar: {totalPendingKits}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {deliveryProgressPct}% Concluído
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${deliveryProgressPct}%` }}
            />
          </div>
        </div>

        {/* Leitor de Câmera QR Code Aberto */}
        {isScannerOpen && (
          <div className="p-5 rounded-2xl bg-slate-950 text-white border-2 border-orange-500/60 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-black uppercase tracking-wider text-orange-400">
                  Leitor Óptico de QR Code Ativo
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Alternar Câmera</span>
                </button>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs font-bold text-white flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Fechar</span>
                </button>
              </div>
            </div>

            {scannerError ? (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-xs text-red-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{scannerError}</span>
              </div>
            ) : (
              <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-orange-500 shadow-2xl bg-black aspect-4/3 flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-8 border-2 border-dashed border-emerald-400/90 rounded-2xl pointer-events-none flex items-end justify-center pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    Posicione o QR Code do Atleta no Quadro
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensagem de Feedback da Entrega */}
        {deliveryMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 ${
              deliveryMessage.type === 'success'
                ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-2 border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {deliveryMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm">{deliveryMessage.text}</span>
            </div>
            <button onClick={() => setDeliveryMessage(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grid Principal: Coluna Esquerda (Busca + Fila) | Coluna Direita (Card de Conferência & Baixa em 1 Toque) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Busca e Fila Rápida (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Localizar Atleta (QR Code, Protocolo, CPF, Nome ou Nº de Peito)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={kitSearch}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="Digite CPF, Nome, Protocolo (LP5-...) ou escaneie com leitor USB..."
                  className="w-full pl-10 pr-9 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {kitSearch && (
                  <button
                    type="button"
                    onClick={() => setKitSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtros Rápidos da Fila */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQueueFilterStatus('PENDING')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    queueFilterStatus === 'PENDING'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  ⏳ Faltam Retirar ({totalPendingKits})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilterStatus('DELIVERED')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    queueFilterStatus === 'DELIVERED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  ✅ Já Entregues ({totalDeliveredKits})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilterStatus('ALL_CONFIRMED')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    queueFilterStatus === 'ALL_CONFIRMED'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Todos Pagos ({totalConfirmedKits})
                </button>
              </div>

              <div className="flex items-center gap-1">
                {(['ALL', 'PP', 'P', 'M', 'G', 'GG', 'XG'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setQueueFilterSize(sz)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                      queueFilterSize === sz
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sz === 'ALL' ? 'Tam: Todos' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Resultados / Fila de Entrega */}
            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-96 overflow-y-auto bg-white">
              {searchResults.length === 0 ? (
                <div className="py-10 px-4 text-center text-xs text-slate-400">
                  Nenhum atleta encontrado para o filtro selecionado.
                </div>
              ) : (
                searchResults.map((reg) => {
                  const isSelected = selectedAthleteForKit?.id === reg.id;
                  const savedBib = extractBibNumber(reg.kitNotes);
                  const isLocal =
                    reg.originType === 'LOCAL' ||
                    reg.originType === 'CASA' ||
                    reg.category.includes('LOCAL') ||
                    reg.category.includes('CASA');
                  const isPcd = reg.originType === 'PCD' || reg.category.startsWith('PCD_');

                  return (
                    <div
                      key={reg.id}
                      onClick={() => handleSelectAthleteForKit(reg)}
                      className={`p-3.5 text-xs cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-orange-50/90 border-l-4 border-orange-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {reg.athlete?.fullName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPcd
                                ? 'bg-purple-100 text-purple-800'
                                : isLocal
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPcd ? '♿ PCD' : isLocal ? '🏠 Local' : '🌐 Visitante'}
                          </span>
                          {savedBib && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-orange-400 font-mono font-bold text-[10px]">
                              Peito Nº {savedBib}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                          <span>CPF: {formatCPF(reg.athlete?.cpf || '')}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-orange-700">{reg.protocol}</span>
                          {reg.kitDelivered && reg.kitDeliveredAt && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">
                                Retirado em {formatDateTimeBR(reg.kitDeliveredAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center gap-1">
                          <Shirt className="w-3.5 h-3.5 text-orange-400" />
                          <span>{reg.shirtSize}</span>
                        </div>

                        {reg.kitDelivered ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Entregue</span>
                          </span>
                        ) : reg.status === 'CONFIRMED' ? (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleSelectAthleteForKit(reg);
                            }}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition cursor-pointer"
                          >
                            Conferir & Baixar
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-red-100 text-red-800">
                            Não Quitada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Card de Conferência Visual & Baixa em 1 Toque (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-3xl border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-orange-600" />
                <span>Painel de Conferência & Baixa do Kit</span>
              </h4>
              {selectedAthleteForKit && (
                <button
                  type="button"
                  onClick={() => setSelectedAthleteForKit(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {selectedAthleteForKit ? (
              <form onSubmit={(e) => handleConfirmDelivery(e)} className="space-y-4">
                {/* Banner Visual de Status do Kit */}
                {selectedAthleteForKit.kitDelivered ? (
                  <div className="p-4 rounded-2xl bg-red-600 text-white space-y-1.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        BLOQUEADO — KIT JÁ RETIRADO!
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-800 text-[10px] font-mono font-bold">
                        {selectedAthleteForKit.protocol}
                      </span>
                    </div>
                    <p className="text-xs text-red-100 leading-relaxed">
                      Entregue em <strong>{formatDateTimeBR(selectedAthleteForKit.kitDeliveredAt)}</strong> por{' '}
                      <strong>{selectedAthleteForKit.kitDeliveredBy || 'Mesa Oficial'}</strong>.
                    </p>
                  </div>
                ) : selectedAthleteForKit.status !== 'CONFIRMED' ? (
                  <div className="p-4 rounded-2xl bg-amber-500 text-slate-950 space-y-1 shadow-md">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      BLOQUEADO — INSCRIÇÃO NÃO QUITADA ({selectedAthleteForKit.status})
                    </span>
                    <p className="text-xs font-medium">
                      O pagamento desta inscrição ainda não consta como confirmado.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">
                          LIBERADO PARA ENTREGA DO KIT
                        </span>
                        <span className="text-[11px] text-emerald-100">
                          Inscrição Paga e Homologada • Protocolo {selectedAthleteForKit.protocol}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card de Dados do Atleta + Destaque Gigante do Tamanho da Camisa */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Atleta Identificado
                    </span>
                    <div className="font-black text-slate-900 text-base leading-tight">
                      {selectedAthleteForKit.athlete?.fullName}
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      CPF: <strong>{formatCPF(selectedAthleteForKit.athlete?.cpf || '')}</strong>
                    </div>
                    {selectedAthleteForKit.athlete?.birthDate && (
                      <div className="text-[11px] text-slate-500">
                        Nasc.: {formatDateBR(selectedAthleteForKit.athlete.birthDate)}
                        {calculateAthleteAge(selectedAthleteForKit.athlete.birthDate) !== null && (
                          <strong className="ml-1 text-slate-800">
                            ({calculateAthleteAge(selectedAthleteForKit.athlete.birthDate)} anos)
                          </strong>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Badge Gigante do Tamanho da Camisa */}
                  <div className="flex flex-col items-center justify-center bg-orange-600 text-white px-4 py-3 rounded-2xl shadow-md shrink-0 min-w-[82px]">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-100">
                      CAMISA
                    </span>
                    <span className="text-3xl font-black leading-none mt-0.5">
                      {selectedAthleteForKit.shirtSize}
                    </span>
                  </div>
                </div>

                {/* Alertas Automáticos de Conferência Documental na Mesa */}
                <div className="space-y-2">
                  {/* Alerta Categoria Local */}
                  {(selectedAthleteForKit.originType === 'LOCAL' ||
                    selectedAthleteForKit.originType === 'CASA' ||
                    selectedAthleteForKit.category.includes('LOCAL') ||
                    selectedAthleteForKit.category.includes('CASA')) && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block uppercase text-[11px] text-amber-900">
                          🏠 Categoria Local (Lajespintadense)
                        </strong>
                        <span className="text-[11px] text-amber-800">
                          Conferir comprovante de vínculo com Lajes Pintadas/RN (Título Eleitoral, Certidão ou Comprovante de Residência).
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Alerta Menor de 18 Anos */}
                  {(() => {
                    const age = calculateAthleteAge(selectedAthleteForKit.athlete?.birthDate);
                    if (age !== null && age < 18) {
                      return (
                        <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl text-xs text-blue-950 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block uppercase text-[11px] text-blue-900">
                              🎂 Atleta Menor de 18 Anos ({age} anos)
                            </strong>
                            <span className="text-[11px] text-blue-800">
                              Recolher termo de autorização assinado pelo responsável legal.
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Alerta PCD e Atleta-Guia */}
                  {(selectedAthleteForKit.isPcd ||
                    selectedAthleteForKit.category.startsWith('PCD_') ||
                    (selectedAthleteForKit.kitNotes && selectedAthleteForKit.kitNotes.includes('PCD_META'))) && (
                    <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl text-xs text-purple-950 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-purple-900 uppercase text-[11px]">
                        <span>♿ Categoria PCD — Conferir Laudo Médico ou CIPTEA</span>
                      </div>
                      {selectedAthleteForKit.hasGuide && (
                        <div className="p-2.5 bg-white rounded-lg border border-purple-300 flex items-center justify-between">
                          <div>
                            <span className="font-black text-orange-600 block text-[11px] uppercase">
                              🏃‍♂️ +1 Kit de Atleta-Guia: {selectedAthleteForKit.guideName || 'Guia'}
                            </span>
                            <span className="text-[11px] text-slate-700">
                              Entregar 2 camisas e 2 números de peito!
                            </span>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                            Guia: {selectedAthleteForKit.guideShirtSize || 'M'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Campos Rápidos: Nº de Peito (Opcional), Atendente e Observações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nº do Peito / Chip (Opcional)
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={bibNumber}
                        onChange={(e) => setBibNumber(e.target.value)}
                        placeholder="Ex: 108"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Atendente / Mesa
                    </label>
                    <input
                      type="text"
                      required
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Observações de Entrega (Opcional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Ex: Retirado mediante RG original / Comprovante Local verificado"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoOpenNextScan}
                    onChange={(e) => setAutoOpenNextScan(e.target.checked)}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Modo Fila Rápida: abrir câmera automaticamente após confirmar entrega</span>
                </label>

                {!selectedAthleteForKit.kitDelivered ? (
                  <button
                    type="submit"
                    disabled={isSubmittingDelivery || selectedAthleteForKit.status !== 'CONFIRMED'}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm uppercase tracking-wide rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PackageCheck className="w-5 h-5" />
                    <span>
                      {isSubmittingDelivery
                        ? 'Registrando Baixa...'
                        : `Confirmar Entrega • Camisa ${selectedAthleteForKit.shirtSize}`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUndoDelivery(selectedAthleteForKit)}
                    disabled={isUndoingDelivery}
                    className="w-full py-2.5 px-4 bg-white hover:bg-red-50 border border-red-300 text-red-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>
                      {isUndoingDelivery ? 'Estornando...' : 'Desfazer / Estornar Baixa deste Kit'}
                    </span>
                  </button>
                )}
              </form>
            ) : (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Pronto para Conferência e Baixa Rápida
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Clique em <strong>"📷 Ler QR Code do Atleta"</strong> acima ou selecione um atleta na fila ao lado para visualizar o tamanho da camisa e confirmar a retirada em 1 toque.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Entregas Realizadas */}
        {recentDeliveries.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Últimas Baixas de Kits Registradas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {recentDeliveries.map((d) => {
                const bib = extractBibNumber(d.kitNotes);
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectAthleteForKit(d)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">
                        {d.athlete?.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Tam: <strong className="text-orange-600">{d.shirtSize}</strong>
                        {bib ? ` • Peito Nº ${bib}` : ''} • {formatDateTimeBR(d.kitDeliveredAt)}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Relatório de Demanda de Camisas por Tamanho (Sob Demanda) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                  Demanda de Camisas por Tamanho (Sob Demanda)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  Produção por Demanda
                </span>
              </div>
              <p className="text-xs text-slate-500">
                As camisas são contabilizadas sob demanda conforme as inscrições realizadas (sem trava de estoque por tamanho). Abaixo está a relação exata por tamanho para confecção e entrega.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReconcileStock}
              disabled={isReconciling}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition shadow-2xs"
              title="Auditar inscrições confirmadas e pendentes no banco e sincronizar contadores reais"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin text-orange-600' : 'text-slate-600'}`} />
              <span>{isReconciling ? 'Sincronizando...' : 'Sincronizar Demanda'}</span>
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                onClick={() => setStockView('local')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockView === 'local'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Local (Prefeitura)</span>
              </button>

              <button
                onClick={() => setStockView('visitor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockView === 'visitor'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visitantes (Online)</span>
              </button>

              <button
                onClick={() => setStockView('total')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  stockView === 'total'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Consolidado Geral</span>
              </button>
            </div>
          </div>
        </div>

        {stockError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center justify-between">
            <span>{stockError}</span>
            <button onClick={() => setStockError(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cálculo de Demanda Real por Tamanho a partir das Inscrições */}
        {(() => {
          const sizesOrder: ShirtSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
          const nowMs = Date.now();
          const filteredRegs = registrations.filter((r) => {
            const isLocal =
              r.originType === 'CASA' ||
              r.originType === 'LOCAL' ||
              r.category?.includes('LOCAL') ||
              r.category?.includes('CASA');
            if (stockView === 'local') return isLocal;
            if (stockView === 'visitor') return !isLocal;
            return true;
          });

          const demandBySize = sizesOrder.map((sz) => {
            let confirmed = 0;
            let reserved = 0;
            let delivered = 0;

            for (const reg of filteredRegs) {
              const isConf = reg.status === 'CONFIRMED';
              const isRes =
                reg.status === 'RESERVED' &&
                (!reg.reservationExpiresAt || new Date(reg.reservationExpiresAt).getTime() > nowMs);
              if (reg.shirtSize === sz) {
                if (isConf) {
                  confirmed++;
                  if (reg.kitDelivered) delivered++;
                } else if (isRes) {
                  reserved++;
                }
              }
              if (reg.hasGuide && reg.guideShirtSize === sz) {
                if (isConf) {
                  confirmed++;
                  if (reg.kitDelivered) delivered++;
                } else if (isRes) {
                  reserved++;
                }
              }
            }

            if (registrations.length === 0 && stockView === 'total') {
              const sItem = shirts.find((s) => s.size === sz);
              if (sItem) {
                confirmed = sItem.confirmedCount || 0;
                reserved = sItem.reservedCount || 0;
              }
            }

            return {
              size: sz,
              confirmed,
              reserved,
              totalDemand: confirmed + reserved,
              delivered,
              pendingDelivery: Math.max(0, confirmed - delivered),
            };
          });

          const sumConfirmed = demandBySize.reduce((acc, d) => acc + d.confirmed, 0);
          const sumReserved = demandBySize.reduce((acc, d) => acc + d.reserved, 0);
          const sumTotalDemand = sumConfirmed + sumReserved;
          const sumDelivered = demandBySize.reduce((acc, d) => acc + d.delivered, 0);

          return (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Confirmadas (Pagas)
                  </span>
                  <span className="text-xl font-black text-emerald-700">{sumConfirmed}</span>
                  <span className="text-[10px] text-emerald-600 block">camisas para entrega</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    Reservadas (Aguard. Pix)
                  </span>
                  <span className="text-xl font-black text-amber-700">{sumReserved}</span>
                  <span className="text-[10px] text-amber-600 block">em janela de 30 min</span>
                </div>
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                    Demanda Total Solicitada
                  </span>
                  <span className="text-xl font-black text-orange-600">{sumTotalDemand}</span>
                  <span className="text-[10px] text-orange-500 block">confirmadas + reservadas</span>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Kits Já Entregues
                  </span>
                  <span className="text-xl font-black text-blue-700">{sumDelivered}</span>
                  <span className="text-[10px] text-blue-600 block">retirados pelos atletas</span>
                </div>
              </div>

              {stockSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{stockSuccess}</span>
                  </div>
                  <button onClick={() => setStockSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tamanho</th>
                      <th className="py-3 px-4">Confirmadas (Pagas)</th>
                      <th className="py-3 px-4">Reservadas (Pix)</th>
                      <th className="py-3 px-4">Demanda Total</th>
                      <th className="py-3 px-4">Kits Entregues</th>
                      <th className="py-3 px-4">Faltam Entregar</th>
                      <th className="py-3 px-4">Modalidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {demandBySize.map((row) => (
                      <tr key={row.size} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                          <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm font-bold">
                            {row.size}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-sm text-emerald-700">
                          {row.confirmed}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-600">
                          {row.reserved}
                        </td>
                        <td className="py-3.5 px-4 font-black text-sm text-slate-900">
                          {row.totalDemand}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">
                          {row.delivered}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {row.pendingDelivery}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Sob Demanda (Livre)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* Batch Stock Edit Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ajuste Rápido de Estoque em Lote</h3>
                  <p className="text-[11px] text-slate-500">Configure a grade completa de camisas de uma vez no banco de dados</p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {shirts.map((s) => {
                  const min = (s.reservedCount || 0) + (s.confirmedCount || 0);
                  const currentVal = batchStocks[s.size] !== undefined ? batchStocks[s.size] : s.totalStock;

                  return (
                    <div key={s.size} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center shadow-sm">
                          {s.size}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">Tamanho {s.size}</div>
                          <div className="text-[10px] text-slate-500">
                            Confirmadas: <strong className="text-emerald-600">{s.confirmedCount}</strong> • Reservadas: <strong className="text-amber-600">{s.reservedCount}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-slate-500">Total:</label>
                        <input
                          type="number"
                          min={min}
                          value={currentVal}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setBatchStocks((prev) => ({ ...prev, [s.size]: val }));
                          }}
                          className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  disabled={isSavingBatch}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchModal}
                  disabled={isSavingBatch}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingBatch ? 'Gravando no Banco...' : 'Salvar Grade Completa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
