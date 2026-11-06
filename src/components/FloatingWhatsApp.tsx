import React from 'react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl =
    'https://wa.me/5584981858194?text=Ol%C3%A1%2C+Sidcley%21+Gostaria+de+tirar+uma+d%C3%BAvida+sobre+a+5%C2%AA+Corrida+de+Emancipa%C3%A7%C3%A3o+de+Lajes+Pintadas';

  return (
    <aside
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 print:hidden flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com o organizador Sidcley no WhatsApp: (84) 98185-8194"
        title="Dúvidas sobre a prova? Fale com Sidcley no WhatsApp: (84) 98185-8194"
        className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-3 sm:px-4 sm:py-3 rounded-full shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.55)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-3 focus:ring-emerald-400"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.24 0 2.21-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.42-5.84 2.42-1.44 0-2.85-.38-4.08-1.11l-.29-.17-3.04.8 1.02-2.96-.19-.31a8.15 8.15 0 01-1.25-4.51c0-4.55 3.7-8.24 8.25-8.24m4.54 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
          <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider">
            Dúvidas? Fale Conosco
          </span>
          <span className="text-xs font-black tracking-wide">
            (84) 98185-8194 (Sidcley)
          </span>
        </div>
      </a>
    </aside>
  );
};
