import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MedicalCalculators() {
  const [activeCalc, setActiveCalc] = useState<'glasgow' | 'wells'>('glasgow');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8"
    >
      <div className="border-b border-white/10 pb-5">
        <h1 className="font-serif text-4xl text-barcelo-gold">Calculadoras Médicas</h1>
        <p className="text-text-mut">Herramientas de soporte clínico basadas en evidencia (No requieren IA).</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveCalc('glasgow')}
          className={`px-6 py-3 rounded-lg font-bold text-sm transition-all border ${activeCalc === 'glasgow' ? 'bg-barcelo-bordeaux border-barcelo-gold text-white' : 'bg-white/5 border-white/10 text-text-mut hover:text-white'}`}
        >
          Escala de Glasgow
        </button>
        <button 
          onClick={() => setActiveCalc('wells')}
          className={`px-6 py-3 rounded-lg font-bold text-sm transition-all border ${activeCalc === 'wells' ? 'bg-barcelo-bordeaux border-barcelo-gold text-white' : 'bg-white/5 border-white/10 text-text-mut hover:text-white'}`}
        >
          Criterios de Wells (TVP)
        </button>
      </div>

      <div className="max-w-3xl">
        {activeCalc === 'glasgow' ? <GlasgowCalculator /> : <WellsCalculator />}
      </div>
    </motion.div>
  );
}

function GlasgowCalculator() {
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);

  const total = eye + verbal + motor;

  const getInterpretation = () => {
    if (total >= 13) return { label: 'Leve', color: 'text-green-400' };
    if (total >= 9) return { label: 'Moderado', color: 'text-yellow-400' };
    return { label: 'Grave (Requiere IOT)', color: 'text-red-500' };
  };

  const interpretation = getInterpretation();

  return (
    <div className="bg-bg-surf border border-white/10 rounded-xl p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-barcelo-gold uppercase tracking-widest">Apertura Ocular (E)</label>
          <select value={eye} onChange={e => setEye(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm outline-none focus:border-barcelo-gold">
            <option value={4}>Espontánea (4)</option>
            <option value={3}>A la orden (3)</option>
            <option value={2}>Al dolor (2)</option>
            <option value={1}>Ninguna (1)</option>
          </select>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold text-barcelo-gold uppercase tracking-widest">Respuesta Verbal (V)</label>
          <select value={verbal} onChange={e => setVerbal(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm outline-none focus:border-barcelo-gold">
            <option value={5}>Orientado (5)</option>
            <option value={4}>Desorientado (4)</option>
            <option value={3}>Inapropiado (3)</option>
            <option value={2}>Incomprensible (2)</option>
            <option value={1}>Ninguna (1)</option>
          </select>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold text-barcelo-gold uppercase tracking-widest">Respuesta Motora (M)</label>
          <select value={motor} onChange={e => setMotor(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm outline-none focus:border-barcelo-gold">
            <option value={6}>Obedece órdenes (6)</option>
            <option value={5}>Localiza el dolor (5)</option>
            <option value={4}>Retirada al dolor (4)</option>
            <option value={3}>Flexión anormal (3)</option>
            <option value={2}>Extensión anormal (2)</option>
            <option value={1}>Ninguna (1)</option>
          </select>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col items-center text-center">
        <div className="text-6xl font-serif font-bold text-white mb-2">{total}/15</div>
        <div className={`text-xl font-bold ${interpretation.color}`}>{interpretation.label}</div>
        <p className="text-text-mut text-sm mt-4 max-w-md">
          La Escala de Coma de Glasgow es una escala diseñada para evaluar de manera objetiva el estado de consciencia.
        </p>
      </div>
    </div>
  );
}

function WellsCalculator() {
  const [criteria, setCriteria] = useState({
    cancer: false,
    paralysis: false,
    bedridden: false,
    tenderness: false,
    swellingWhole: false,
    swellingCalf: false,
    pittingEdema: false,
    collateralVeins: false,
    alternativeDiagnosis: false
  });

  const toggle = (key: keyof typeof criteria) => {
    setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const score = Object.entries(criteria).reduce((acc, [key, val]) => {
    if (!val) return acc;
    return key === 'alternativeDiagnosis' ? acc - 2 : acc + 1;
  }, 0);

  const getRisk = () => {
    if (score >= 3) return { label: 'Probabilidad Alta (75%)', color: 'text-red-500' };
    if (score >= 1) return { label: 'Probabilidad Moderada (17%)', color: 'text-yellow-400' };
    return { label: 'Probabilidad Baja (3%)', color: 'text-green-400' };
  };

  const risk = getRisk();

  const items = [
    { key: 'cancer', label: 'Cáncer activo (tratamiento en los últimos 6 meses)' },
    { key: 'paralysis', label: 'Parálisis, paresia o inmovilización reciente de miembros inferiores' },
    { key: 'bedridden', label: 'Encamamiento reciente > 3 días o cirugía mayor < 12 semanas' },
    { key: 'tenderness', label: 'Hipersensibilidad localizada a lo largo del sistema venoso profundo' },
    { key: 'swellingWhole', label: 'Tumefacción en toda la extremidad inferior' },
    { key: 'swellingCalf', label: 'Aumento del perímetro de la pantorrilla > 3 cm' },
    { key: 'pittingEdema', label: 'Edema con fóvea (mayor en la extremidad sintomática)' },
    { key: 'collateralVeins', label: 'Venas colaterales superficiales (no varicosas)' },
    { key: 'alternativeDiagnosis', label: 'Diagnóstico alternativo tan probable como la TVP (-2 puntos)', isNegative: true },
  ];

  return (
    <div className="bg-bg-surf border border-white/10 rounded-xl p-8 space-y-6">
      <div className="space-y-3">
        {items.map(item => (
          <div 
            key={item.key}
            onClick={() => toggle(item.key as any)}
            className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${criteria[item.key as keyof typeof criteria] ? 'bg-barcelo-blue/30 border-barcelo-gold' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <span className="text-sm">{item.label}</span>
            {criteria[item.key as keyof typeof criteria] ? <CheckCircle2 size={20} className="text-barcelo-gold" /> : <div className="w-5 h-5 rounded-full border border-white/20" />}
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col items-center text-center">
        <div className="text-5xl font-serif font-bold text-white mb-2">Puntaje: {score}</div>
        <div className={`text-xl font-bold ${risk.color}`}>{risk.label}</div>
        <div className="mt-6 flex gap-4">
          <div className="flex items-center gap-2 text-xs text-text-mut">
            <AlertCircle size={14} /> Sensibilidad: 97%
          </div>
          <div className="flex items-center gap-2 text-xs text-text-mut">
            <Activity size={14} /> Especificidad: 71%
          </div>
        </div>
      </div>
    </div>
  );
}
