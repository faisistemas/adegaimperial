import React, { useState } from 'react';
import { 
  Wine, CheckCircle2, ArrowRight, ShieldCheck, Zap, 
  Smartphone, BarChart3, Users, DollarSign, Clock, 
  ChevronDown, ChevronUp, Sparkles, MessageCircle, 
  Layers, Package, Monitor, Cpu, QrCode, TrendingUp, 
  Flame, Check, HelpCircle, Star, PhoneCall, Play, 
  Award, Lock, Store, FileText, RefreshCw, X
} from 'lucide-react';
import { LoginPortalModal } from './LoginPortalModal';

interface SalesLandingPageViewProps {
  onEnterSystem: () => void;
}

export const SalesLandingPageView: React.FC<SalesLandingPageViewProps> = ({
  onEnterSystem,
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [interactiveTab, setInteractiveTab] = useState<'PDV' | 'DOSES' | 'COMANDAS' | 'FINANCEIRO'>('PDV');

  // Lead Form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    adegaName: '',
    city: '',
  });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSuccess(true);
    setTimeout(() => {
      // Allow user to enter directly into the demo system after submitting lead
      setLeadModalOpen(false);
      setLeadSuccess(false);
      onEnterSystem();
    }, 1800);
  };

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent('Olá! Gostaria de conhecer o sistema AdegaPro PDV e agendar uma demonstração gratuita para minha adega.');
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
  };

  const faqs = [
    {
      q: 'O sistema funciona sem internet no caixa?',
      a: 'Sim! O PDV do AdegaPro possui contingência offline contínua. Você continua passando vendas no balcão, registrando comandas e emitindo comprovantes mesmo se a internet cair. Assim que a conexão retorna, tudo é sincronizado automaticamente em nuvem.'
    },
    {
      q: 'Consigo conectar balança de pesagem e leitor de código de barras?',
      a: 'Com certeza! Suportamos comunicação serial direta (RS-232 / USB) com as principais balanças do mercado (Toledo Prix 3, Toledo 9094, Filizola, Urano e Elgin) para pesagem automática de gelo, carvão, petiscos e a granel, além de qualquer leitor de código de barras USB ou Bluetooth.'
    },
    {
      q: 'Como funciona o controle de garrafas abertas e doses?',
      a: 'O sistema possui módulo exclusivo para fracionamento de destilados. Você abre uma garrafa de Whisky, Gin ou Vodka no sistema, e ele debita exatamente a dose (ex: 50ml) a cada venda, controlando o volume restante em mililitros e impedindo desperdícios ou desvios.'
    },
    {
      q: 'Tem limite de produtos cadastrados ou comandas?',
      a: 'Nenhum limite! Você pode cadastrar milhares de itens, abrir centenas de comandas simultâneas, gerenciar múltiplas mesas com cardápio QR Code e adicionar quantos operadores de caixa forem necessários.'
    },
    {
      q: 'É possível emitir Cupom Fiscal (NFC-e / SAT / NF-e)?',
      a: 'Sim, o AdegaPro possui emissor fiscal integrado compatível com NFC-e e SAT em todos os estados do Brasil, com regras tributárias pré-configuradas para bebidas, cervejas e destilados (incluindo ICMS ST e PIS/COFINS monofásico).'
    },
    {
      q: 'Como é feita a implantação e o suporte?',
      a: 'Nossa equipe faz todo o acompanhamento inicial via chamada de vídeo e WhatsApp. O sistema já vem com um catálogo padrão de mais de 1.500 bebidas prontas para usar, permitindo que sua adega comece a operar em menos de 15 minutos.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 overflow-x-hidden">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0D]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg shadow-amber-950/50 bg-zinc-950 shrink-0 ring-1 ring-amber-500/25">
            <img
              src="/logo.jpg"
              alt="Adega Imperial"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Navigation Anchor Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-zinc-300 font-medium">
          <a href="#problemas" className="hover:text-amber-400 transition-colors">Dores & Solução</a>
          <a href="#recursos" className="hover:text-amber-400 transition-colors">Funcionalidades</a>
          <a href="#como-funciona" className="hover:text-amber-400 transition-colors">Como Funciona</a>
          <a href="#beneficios" className="hover:text-amber-400 transition-colors">Ganhos Reais</a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">Dúvidas</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleWhatsAppClick}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Falar com Especialista</span>
          </button>

          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Acessar Sistema / Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-xs font-medium text-amber-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Desenvolvido exclusivamente para o segmento de bebidas & adegas</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-zinc-100 leading-[1.15]">
            SISTEMA PDV COMPLETO <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              PARA SUA ADEGA
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Controle vendas, estoque, clientes, comandas e produtos em um único sistema. 
            Mais organização para sua operação e mais agilidade no atendimento.
          </p>

          {/* Frase de Impacto */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 max-w-xl mx-auto text-xs sm:text-sm font-serif italic text-amber-200/90 shadow-lg">
            "Sua adega mais organizada, suas vendas mais rápidas e sua gestão muito mais inteligente."
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => setLeadModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>QUERO CONHECER O SISTEMA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterSystem}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 hover:border-amber-500/50 text-zinc-100 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-400" />
              <span>TESTAR AGORA (DEMO)</span>
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>FALAR COM UM ESPECIALISTA</span>
            </button>
          </div>

          {/* Badges de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-4 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Teste grátis disponível
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Sem fidelidade contratual
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Implantação em 15 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-400" />
              Suporte especializado em adegas
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE PREVIEW */}
        <div className="mt-14 relative rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-zinc-400 ml-2">Painel Operacional AdegaPro v4.2</span>
            </div>

            {/* Sub Tabs Toggle for interactive demo */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setInteractiveTab('PDV')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  interactiveTab === 'PDV' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Frente de Caixa (PDV)
              </button>
              <button
                onClick={() => setInteractiveTab('DOSES')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  interactiveTab === 'DOSES' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Bancada de Doses & ML
              </button>
              <button
                onClick={() => setInteractiveTab('COMANDAS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  interactiveTab === 'COMANDAS' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Mesas & Comandas
              </button>
              <button
                onClick={() => setInteractiveTab('FINANCEIRO')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  interactiveTab === 'FINANCEIRO' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                DRE & Lucro
              </button>
            </div>
          </div>

          {/* Interactive Screen Simulation */}
          <div className="min-h-[280px] bg-zinc-950 rounded-2xl p-5 border border-zinc-800/80">
            {interactiveTab === 'PDV' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
                        F1
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-100">Leitor de Barras / Balança Toledo</div>
                        <div className="text-[11px] text-zinc-400 font-mono">STX + 01.250kg + ETX (Balança Estável)</div>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                      Online
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                      <span>1x Whisky Red Label 1L (Garrafa)</span>
                      <span className="font-bold text-amber-300">R$ 119,90</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                      <span>2x Energético Red Bull 250ml</span>
                      <span className="font-bold text-amber-300">R$ 25,80</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                      <span>1x Gelo Sabor Maracujá 200g</span>
                      <span className="font-bold text-amber-300">R$ 6,00</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-zinc-900 border border-amber-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Total Cupom</span>
                    <div className="text-2xl font-black font-mono text-amber-400">R$ 151,70</div>
                    <span className="text-[11px] text-emerald-400">Desconto Combo Automático Aplicado</span>
                  </div>
                  <button
                    onClick={onEnterSystem}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    Simular Finalização [F5]
                  </button>
                </div>
              </div>
            )}

            {interactiveTab === 'DOSES' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-200">Gin Tanqueray 750ml</span>
                  <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800">
                    <div className="bg-emerald-500 h-full w-[70%]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>525ml restantes</span>
                    <span>10 doses</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-200">Whisky Jack Daniel's 1L</span>
                  <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800">
                    <div className="bg-amber-500 h-full w-[45%]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>450ml restantes</span>
                    <span>9 doses</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-zinc-200">Vodka Cîroc 750ml</span>
                  <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800">
                    <div className="bg-rose-500 h-full w-[15%]" />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-rose-400">
                    <span>110ml (Alerta de Reposição)</span>
                    <span>2 doses</span>
                  </div>
                </div>
              </div>
            )}

            {interactiveTab === 'COMANDAS' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
                {[
                  { num: '01', status: 'Ocupada', total: 'R$ 214,00', garcom: 'Carlos' },
                  { num: '02', status: 'Ocupada', total: 'R$ 89,50', garcom: 'Mariana' },
                  { num: '03', status: 'Livre', total: 'R$ 0,00', garcom: '—' },
                  { num: '04', status: 'Ocupada', total: 'R$ 340,00', garcom: 'Carlos' },
                ].map((m) => (
                  <div 
                    key={m.num}
                    className={`p-3.5 rounded-xl border ${
                      m.status === 'Ocupada' ? 'bg-zinc-900 border-amber-500/40' : 'bg-zinc-900/40 border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold">
                      <span>Mesa {m.num}</span>
                      <span className={m.status === 'Ocupada' ? 'text-amber-400' : 'text-zinc-500'}>
                        {m.status}
                      </span>
                    </div>
                    <div className="text-sm font-mono font-bold text-zinc-100 mt-2">{m.total}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Garçom: {m.garcom}</div>
                  </div>
                ))}
              </div>
            )}

            {interactiveTab === 'FINANCEIRO' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase font-mono">Faturamento Hoje</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">R$ 5.840,00</div>
                  <p className="text-[10px] text-zinc-500 mt-1">+24% em relação à última sexta</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase font-mono">CMV de Bebidas</span>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">41.2%</div>
                  <p className="text-[10px] text-emerald-400 mt-1">Dentro da meta gerencial</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase font-mono">Lucro Líquido Estimado</span>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">R$ 2.410,50</div>
                  <p className="text-[10px] text-zinc-500 mt-1">DRE consolidada em tempo real</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. O PROBLEMA (DORES REAIS) */}
      <section id="problemas" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            Você enfrenta esses gargalos diários?
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            Os 5 Maiores Erros Que Drenam o Lucro de Uma Adega
          </h2>
          <p className="text-sm text-zinc-400">
            Sistemas genéricos não entendem a dinâmica de balcão de bebidas, gerando desvios e prejuízos invisíveis todo fim de semana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-rose-500/20 space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-zinc-100">Descontrole em Doses e Garrafas Abertas</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Doses servidas a mais pelo atendente, garrafas que somem no fim da noite e falta de controle exato de mililitros que evaporam o lucro.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-rose-500/20 space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-zinc-100">Filas Quilométricas no Horário de Pico</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sistemas lentos que travam na sexta à noite, obrigando o caixa a digitar código na mão e fazendo clientes desistirem da compra.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-rose-500/20 space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-zinc-100">Fiado em Caderninho e Inadimplência</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Vendas a prazo anotadas sem limite de crédito, clientes que esquecem de pagar e ausência de bloqueio automático por atraso.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-rose-500/20 space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="text-base font-bold text-zinc-100">Falta de Clareza do Lucro Líquido Real</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O dono da adega vê a conta cheia na segunda-feira, mas não sabe quanto foi CMV (Custo de Mercadoria), despesa fixa ou lucro de verdade.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-rose-500/20 space-y-3 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              05
            </div>
            <h3 className="text-base font-bold text-zinc-100">Perda de Vasilhames, Cascos e Barris</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cascos de cerveja e barris de chopp que saem sem caução registrada, gerando prejuízos constantes na troca com as distribuidoras.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/40 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">A Virada de Chave</span>
              <h3 className="text-base font-bold text-zinc-100 mt-1">Acabe com o Prejuízo Oculto</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                O AdegaPro foi desenhado linha por linha para blindar seu estoque e transformar sua adega em uma máquina organizada e lucrativa.
              </p>
            </div>
            <button
              onClick={() => setLeadModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>Quero Blindar Minha Adega</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FUNCIONALIDADES PRINCIPAIS (FEATURES) */}
      <section id="recursos" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Tudo o que sua operação precisa
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            Recursos Especializados de Alto Desempenho
          </h2>
          <p className="text-sm text-zinc-400">
            Desenvolvido sob medida para a agilidade do balcão, a precisão das bebidas e a segurança financeira do dono.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">PDV Ultrarrápido no Balcão</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Atalhos de teclado F1-F12, leitor de código de barras contínuo e pesagem serial Toledo/Filizola automática.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wine className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Bancada de Doses & Fracionamento</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Controle garrafas abertas, mililitros exatos debitados a cada dose, perdas zero e alertas de reposição.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Mesas & Cardápio Digital QR</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Clientes pedem direto pelo celular na mesa ou o garçom lança em tempo real pelo terminal mobile.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">KDS para Bar & Copa</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tela digital de pedidos organizada por tempo para barmen e preparo de drinks sem erros ou pedidos perdidos.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Gestão de Fiado & Crédito</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Limite de crédito parametrizado por cliente, bloqueio automático por dias de atraso e comprovante WhatsApp.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Fechamento Cego de Caixa</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Operador conta o dinheiro sem saber o valor do sistema, eliminando divergências e desvios de sangria.
            </p>
          </div>

          {/* Card 7 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Vasilhames & Cascos</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Controle rigoroso de vasilhames cheios, vazios e caução cobrada ou devolvida na troca de cervejas.
            </p>
          </div>

          {/* Card 8 */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Multilojas & Franquias</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gerencie duas ou mais unidades da sua adega em um único painel com transferências de mercadoria entre estoques.
            </p>
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA (PASSO A PASSO) */}
      <section id="como-funciona" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Simples, Rápido e Descomplicado
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            Como Funciona a Implantação do AdegaPro
          </h2>
          <p className="text-sm text-zinc-400">
            Em menos de 15 minutos sua adega está pronta para faturar com segurança total.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Ativação Rápida</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Liberamos seu acesso instantâneo na nuvem com permissões para Administrador, Caixas e Garçons configurados.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Catálogo Pré-Carregado</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Mais de 1.500 bebidas já cadastradas com código de barras, NCM e tributação para você não perder tempo digitando.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-zinc-100">Operação em Alto Nível</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sua equipe aprende em 10 minutos a operar o PDV, abrir comandas e emitir notas sem travar a fila.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BENEFÍCIOS REAIS & NÚMEROS */}
      <section id="beneficios" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Resultados Mensuráveis
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-zinc-100 leading-tight">
                Mais Agilidade na Fila e Dinheiro Vivo no Seu Bolso
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Nossos clientes relatam transformação total na rotina da adega já na primeira semana de operação.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Redução imediata de até 90% em perdas de doses e avarias</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>35% mais rapidez no fechamento de pedidos no caixa</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Fim do calote no fiado com alertas inteligentes no WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">+35%</div>
                <div className="text-xs text-zinc-300 font-semibold">Agilidade no PDV</div>
                <div className="text-[10px] text-zinc-500">Filas zeradas no pico</div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">-90%</div>
                <div className="text-xs text-zinc-300 font-semibold">Perdas em Doses</div>
                <div className="text-[10px] text-zinc-500">ML exato controlado</div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">100%</div>
                <div className="text-xs text-zinc-300 font-semibold">Fiado Sob Controle</div>
                <div className="text-[10px] text-zinc-500">Com limites definidos</div>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">4.9/5</div>
                <div className="text-xs text-zinc-300 font-semibold">Avaliação Média</div>
                <div className="text-[10px] text-zinc-500">+1.200 adegas ativas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PÚBLICO-ALVO */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Feito sob medida para você
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            Quem Usa e Recomenda o AdegaPro?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Adegas de Bairro',
              desc: 'Atendimento rápido no balcão, combos de whisky e vodka, gelo e copos sem travar a fila.'
            },
            {
              title: 'Distribuidoras de Bebidas',
              desc: 'Venda no atacado e varejo, controle de engradados, fardos e entregas delivery com rota rápida.'
            },
            {
              title: 'Bares & Lounges',
              desc: 'Mesas, comandas individuais, cardápio por QR Code e integração direta com o KDS do barman.'
            },
            {
              title: 'Empórios & Conveniências',
              desc: 'Controle de rótulos nobres, pesagem de petiscos na balança e emissão rápida de NFC-e.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-base text-amber-400 font-serif">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. DEPOIMENTOS / PROVA SOCIAL */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Casos Reais
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            O Que Donos de Adegas Dizem do Sistema
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "O controle de doses salvou minha adega. Antes nós abríamos 5 garrafas de Jack Daniel's e no fim de semana nunca fechava a conta. Hoje sabemos cada gota servida."
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                RC
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">Rodrigo Camargo</div>
                <div className="text-[10px] text-zinc-500">Adega Camargo • São Paulo - SP</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "A balança conectada direto no PDV agilizou muito a pesagem de gelo e petiscos. Não tem mais fila empacando o caixa nos sábados. O sistema é muito rápido."
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">Marcos Silveira</div>
                <div className="text-[10px] text-zinc-500">Distribuidora Silveira • Campinas - SP</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed italic">
                "O fechamento cego de caixa acabou com as divergências dos operadores. Cada um confere o seu dinheiro na gaveta sem ver o relatório antes. Nota 10!"
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                FA
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">Fabiana Almeida</div>
                <div className="text-[10px] text-zinc-500">Lounge & Adega Premium • Curitiba - PR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto border-t border-zinc-800/80">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-zinc-100">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-zinc-100 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. CTA FINAL DE ALTA CONVERSÃO */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-8 sm:p-14 text-zinc-950 overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
              Pronto Para Levar Sua Adega ao Próximo Nível de Lucro?
            </h2>
            <p className="text-sm sm:text-base font-medium opacity-90 max-w-xl mx-auto">
              Comece agora mesmo com demonstração gratuita. Sem taxa de cancelamento e com suporte dedicado.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={() => setLeadModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer"
              >
                <span>QUERO CONHECER O SISTEMA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onEnterSystem}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>TESTAR DEMO AGORA</span>
              </button>

              <button
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-950/20 hover:bg-zinc-950/30 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>FALAR NO WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-12 px-4 sm:px-8 max-w-7xl mx-auto border-t border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Adega Imperial" className="w-5 h-5 rounded-md object-cover border border-amber-500/30" />
          <span className="font-bold text-zinc-300 font-serif">ADEGAPRO</span>
          <span>— Sistema Especializado para Gestão de Adegas e Bebidas</span>
        </div>
        <div>
          © {new Date().getFullYear()} AdegaPro Software. Todos os direitos reservados.
        </div>
      </footer>

      {/* LOGIN MODAL */}
      <LoginPortalModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
          onEnterSystem();
        }}
      />

      {/* LEAD CONVERSION MODAL */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100">
            <button
              onClick={() => setLeadModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            {leadSuccess ? (
              <div className="text-center py-8 space-y-3 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-serif text-zinc-100">Demonstração Liberada!</h3>
                <p className="text-xs text-zinc-400">
                  Entrando no ambiente interativo de testes do AdegaPro...
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                    Teste Gratuito
                  </span>
                  <h3 className="text-xl font-bold font-serif text-zinc-100">
                    Conheça o AdegaPro na Prática
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Preencha seus dados para receber a demonstração e testar agora:
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Seu Nome</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="Ex: João da Silva"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">WhatsApp / Telefone</label>
                    <input
                      type="tel"
                      required
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Nome da sua Adega</label>
                    <input
                      type="text"
                      required
                      value={leadForm.adegaName}
                      onChange={(e) => setLeadForm({ ...leadForm, adegaName: e.target.value })}
                      placeholder="Ex: Adega do Ponto"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-2 cursor-pointer"
                  >
                    <span>Testar Sistema Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
