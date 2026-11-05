import QRCode from 'qrcode';

export function buildKitQrPayload(protocol: string, accessCode?: string): string {
  const cleanProto = (protocol || '').trim().toUpperCase();
  const cleanCode = (accessCode || '').trim().toUpperCase();
  return cleanCode ? `LP5-KIT:${cleanProto}:${cleanCode}` : `LP5-KIT:${cleanProto}`;
}

export function parseKitQrPayload(raw: string): {
  protocol: string | null;
  accessCode: string | null;
  rawTerm: string;
} {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return { protocol: null, accessCode: null, rawTerm: '' };
  }

  // Formato oficial: LP5-KIT:LP5-2611-FF97F:0AA3F7
  const kitMatch = trimmed.match(/LP5-KIT:([A-Z0-9-]+)(?::([A-Z0-9]+))?/i);
  if (kitMatch) {
    return {
      protocol: kitMatch[1].toUpperCase(),
      accessCode: kitMatch[2] ? kitMatch[2].toUpperCase() : null,
      rawTerm: kitMatch[1].toUpperCase(),
    };
  }

  // Protocolo direto: LP5-XXXX-XXXXX
  const protoMatch = trimmed.match(/(LP5-[A-Z0-9-]+)/i);
  if (protoMatch) {
    return {
      protocol: protoMatch[1].toUpperCase(),
      accessCode: null,
      rawTerm: protoMatch[1].toUpperCase(),
    };
  }

  return {
    protocol: null,
    accessCode: null,
    rawTerm: trimmed,
  };
}

export async function generateKitQrDataUrl(protocol: string, accessCode?: string): Promise<string> {
  const payload = buildKitQrPayload(protocol, accessCode);
  return QRCode.toDataURL(payload, {
    width: 240,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

export function extractBibNumber(kitNotes?: string | null): string | null {
  if (!kitNotes || typeof kitNotes !== 'string') return null;
  const m = kitNotes.match(/\|?BIB:([^|]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export function extractDeliveryNote(kitNotes?: string | null): string | null {
  if (!kitNotes || typeof kitNotes !== 'string') return null;
  const m = kitNotes.match(/\|?KIT_DELIVERY_NOTE:([^|]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export function calculateAthleteAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  return age;
}

export function playFeedbackBeep(type: 'scan' | 'success' | 'error'): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'scan') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(165, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    }
  } catch {}
}

