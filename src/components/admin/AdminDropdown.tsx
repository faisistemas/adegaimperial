import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Star, Ticket, CreditCard, Settings, 
  ChevronDown, Moon
} from 'lucide-react';

interface AdminDropdownProps {
  onOpenUsuarios: () => void;
  onOpenFidelidade: () => void;
  onOpenFichas: () => void;
  onOpenCreditoDigital: () => void;
  onOpenConfiguracoes: () => void;
}

export const AdminDropdown: React.FC<AdminDropdownProps> = ({
  onOpenUsuarios,
  onOpenFidelidade,
  onOpenFichas,
  onOpenCreditoDigital,
  onOpenConfiguracoes,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-2.5" ref={dropdownRef}>
      {/* Botão Admin com Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
            isOpen
              ? 'bg-zinc-800 text-white border-zinc-700 shadow-md ring-1 ring-zinc-700'
              : 'bg-zinc-900/90 hover:bg-zinc-850 text-zinc-200 border-zinc-800 hover:border-zinc-700'
          }`}
          title="Menu de Administração"
        >
          {/* Ícone de Admin (Shield com silhueta) */}
          <div className="w-4 h-4 text-zinc-300 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-zinc-300 stroke-zinc-950"
              strokeWidth="1.5"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
              <circle cx="12" cy="10" r="2.5" className="fill-zinc-950" />
              <path d="M7.5 16.5c.8-2 2.5-2.8 4.5-2.8s3.7.8 4.5 2.8" className="stroke-zinc-950" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <span className="font-semibold tracking-tight text-zinc-100">Admin</span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Menu Dropdown exatamente como na imagem */}
        {isOpen && (
          <div className="absolute right-0 sm:left-0 mt-2 w-48 sm:w-52 bg-[#121316] border border-zinc-800/90 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-zinc-800/40">
            <div className="space-y-0.5">
              {/* 1. Usuarios */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenUsuarios)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all text-left cursor-pointer group"
              >
                <Users className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                <span className="font-medium">Usuarios</span>
              </button>

              {/* 2. Fidelidade */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenFidelidade)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all text-left cursor-pointer group"
              >
                <Star className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 shrink-0" />
                <span className="font-medium">Fidelidade</span>
              </button>

              {/* 3. Fichas */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenFichas)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all text-left cursor-pointer group"
              >
                <Ticket className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                <span className="font-medium">Fichas</span>
              </button>

              {/* 4. Crédito Digital */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenCreditoDigital)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all text-left cursor-pointer group"
              >
                <CreditCard className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 shrink-0" />
                <span className="font-medium">Crédito Digital</span>
              </button>

              {/* 5. Configurações */}
              <button
                type="button"
                onClick={() => handleSelect(onOpenConfiguracoes)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition-all text-left cursor-pointer group"
              >
                <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 shrink-0" />
                <span className="font-medium">Configurações</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rótulo Administrador + Badge admin (conforme imagem) */}
      <div className="hidden md:flex items-center gap-1.5">
        <span className="text-xs sm:text-sm font-semibold text-zinc-200">Administrador</span>
        <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 font-medium">
          admin
        </span>
      </div>

      {/* Ícone de Dark Mode / Lua (conforme imagem) */}
      <button
        type="button"
        className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Modo Escuro Ativo"
      >
        <Moon className="w-4 h-4 text-zinc-300" />
      </button>
    </div>
  );
};
