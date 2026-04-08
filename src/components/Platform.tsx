import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, CheckSquare, BarChart3, Headphones, Library, FileText, 
  Stethoscope, LogOut, Menu, X, Play, Download, Send, Brain, Settings, Plus, Loader2
} from 'lucide-react';
import { getCortexResponse } from '../lib/gemini';
import { subscribeToSubjects, getModules, getChapters, triggerGeneration } from '../lib/curriculumService';
import { Subject, Module, Chapter } from '../types';

export default function Platform() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'curso' | 'biblioteca' | 'podcast'>('curso');
  const [activeCourseTab, setActiveCourseTab] = useState<'material' | 'eval' | 'foro'>('material');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'strict' | 'unfiltered'>('strict');
  const [chatMessages, setChatMessages] = useState<{role: 'bot' | 'user', text: string}[]>([
    { role: 'bot', text: 'Bienvenido a la red. Soy Cortex AI, tu tutor entrenado sobre la base bibliográfica de Farreras-Rozman. ¿Qué duda discutimos hoy?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Firestore Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [genYear, setGenYear] = useState(1);
  const [genTitle, setGenTitle] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const user = {
    name: localStorage.getItem('cortex_name') || 'Alumno',
    email: localStorage.getItem('cortex_email') || 'alumno@barcelo.edu.ar',
    isAdmin: localStorage.getItem('cortex_email') === 'atlascortexmed@gmail.com'
  };

  useEffect(() => {
    if (localStorage.getItem('cortex_logged_in') !== 'true') {
      navigate('/');
    }
    
    const unsubscribe = subscribeToSubjects((data) => {
      setSubjects(data);
      if (data.length > 0 && !currentSubject) {
        setCurrentSubject(data[0]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (currentSubject) {
      getModules(currentSubject.id!).then(data => {
        setModules(data);
        if (data.length > 0) setCurrentModule(data[0]);
      });
    }
  }, [currentSubject]);

  useEffect(() => {
    if (currentSubject && currentModule) {
      getChapters(currentSubject.id!, currentModule.id!).then(data => {
        setChapters(data);
        if (data.length > 0) setCurrentChapter(data[0]);
      });
    }
  }, [currentSubject, currentModule]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleLogout = () => {
    localStorage.removeItem('cortex_logged_in');
    navigate('/');
  };

  const handleGenerate = async () => {
    if (!genTitle) return;
    setIsGenerating(true);
    try {
      await triggerGeneration(genYear, genTitle);
      alert("Motor IA iniciado. El contenido aparecerá en breve.");
      setGenTitle('');
    } catch (e) {
      alert("Error al iniciar el motor.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await getCortexResponse(userMsg, aiMode);
    setIsTyping(false);
    setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
  };

  return (
    <div className="flex h-screen bg-bg-main text-text-main overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-bg-surf border-r border-white/10 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-white/10 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-barcelo-blue to-barcelo-bordeaux border border-barcelo-gold rounded-lg flex items-center justify-center font-serif font-bold text-lg">C</div>
          <div>
            <div className="font-serif text-lg leading-tight">Fundación Cortex</div>
            <div className="text-[0.6rem] text-barcelo-gold uppercase tracking-widest">Campus Virtual</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5">
          <div className="mb-6">
            <div className="text-[0.7rem] text-text-mut uppercase tracking-widest px-5 mb-3">Académico</div>
            <MenuItem active={activeView === 'curso'} icon={<BookOpen size={18} />} label="Cursos Matriculados" onClick={() => setActiveView('curso')} />
            <MenuItem icon={<CheckSquare size={18} />} label="Exámenes ERA" />
            <MenuItem icon={<BarChart3 size={18} />} label="Progreso y Notas" />
          </div>
          <div className="mb-6">
            <div className="text-[0.7rem] text-text-mut uppercase tracking-widest px-5 mb-3">Repositorio Médico</div>
            <MenuItem active={activeView === 'podcast'} icon={<Headphones size={18} />} label="Videocast Pulmón 2026" onClick={() => setActiveView('podcast')} />
            <MenuItem active={activeView === 'biblioteca'} icon={<Library size={18} />} label="Biblioteca Virtual" onClick={() => setActiveView('biblioteca')} />
            <MenuItem icon={<FileText size={18} />} label="Apuntes y Resúmenes" />
            <MenuItem icon={<Stethoscope size={18} />} label="Casos Clínicos" />
          </div>
        </nav>

        <div className="p-5 border-t border-white/10 bg-barcelo-blue/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-barcelo-gold rounded-full flex items-center justify-center text-barcelo-blue font-bold">{user.name[0]}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-[0.75rem] text-barcelo-gold">Alumno Barceló</div>
            <button onClick={handleLogout} className="text-[0.7rem] text-text-mut underline mt-1 hover:text-white transition-colors">Cerrar Sesión</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-bg-surf p-4 border-b border-barcelo-gold flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 font-serif text-lg">
            <div className="w-8 h-8 bg-barcelo-gold rounded flex items-center justify-center text-barcelo-blue font-bold text-sm">C</div>
            Atlas Cortex
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
            {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-10 max-w-7xl mx-auto w-full">
          {user.isAdmin && (
            <div className="mb-10 bg-barcelo-blue/10 border border-barcelo-gold/30 p-6 rounded-xl">
              <div className="flex items-center gap-2 text-barcelo-gold font-bold mb-4 uppercase text-xs tracking-widest">
                <Settings size={14} /> Motor Backend IA Autónomo
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[0.6rem] text-text-mut uppercase mb-1 block">Materia a Generar</label>
                  <input 
                    type="text" 
                    value={genTitle}
                    onChange={e => setGenTitle(e.target.value)}
                    placeholder="Ej: Anatomía Humana"
                    className="w-full bg-black/40 border border-white/10 rounded p-2 text-sm outline-none focus:border-barcelo-gold"
                  />
                </div>
                <div>
                  <label className="text-[0.6rem] text-text-mut uppercase mb-1 block">Año</label>
                  <select 
                    value={genYear}
                    onChange={e => setGenYear(parseInt(e.target.value))}
                    className="bg-black/40 border border-white/10 rounded p-2 text-sm outline-none focus:border-barcelo-gold"
                  >
                    {[1,2,3,4,5,6,7].map(y => <option key={y} value={y}>Año {y}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !genTitle}
                  className="bg-barcelo-gold text-barcelo-blue px-6 py-2 rounded font-bold text-sm flex items-center gap-2 hover:bg-white transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Auto-Generar
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-text-mut">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p>Sincronizando con el núcleo neural...</p>
            </div>
          ) : activeView === 'curso' && currentChapter ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="text-sm text-text-mut">
                Campus Virtual &gt; {currentSubject?.title} &gt; <span className="text-barcelo-gold">{currentModule?.title}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <h1 className="font-serif text-4xl">{currentChapter.title}</h1>
                <div className="flex gap-2">
                  {subjects.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setCurrentSubject(s)}
                      className={`px-3 py-1 rounded text-[0.6rem] font-bold uppercase tracking-tighter transition-all ${currentSubject?.id === s.id ? 'bg-barcelo-gold text-barcelo-blue' : 'bg-white/5 border border-white/10 text-text-mut hover:text-white'}`}
                    >
                      {s.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="aspect-video bg-black border border-white/10 rounded-lg relative flex items-center justify-center shadow-2xl overflow-hidden group cursor-pointer">
                <img src={`https://picsum.photos/seed/${currentChapter.id}/1200/675`} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <Play size={64} className="relative z-10 text-white/80 group-hover:text-barcelo-gold group-hover:scale-110 transition-all" />
                <div className="absolute bottom-5 left-5 font-serif text-2xl text-white drop-shadow-lg">{currentChapter.title}</div>
              </div>

              <div className="border-b border-white/10 flex gap-4">
                <Tab active={activeCourseTab === 'material'} label="Material de Apoyo" onClick={() => setActiveCourseTab('material')} />
                <Tab active={activeCourseTab === 'eval'} label="Simulador ERA" onClick={() => setActiveCourseTab('eval')} />
                <Tab active={activeCourseTab === 'foro'} label="Foro Académico" onClick={() => setActiveCourseTab('foro')} />
              </div>

              {activeCourseTab === 'material' && (
                <div className="space-y-4">
                  <MaterialCard title={`Resumen Atlas Cortex - ${currentSubject?.title}`} details="PDF estructurado • 45 MB • Contiene Flowcharts" />
                  <MaterialCard title="Farreras Rozman - Bibliografía Oficial" details="Material Bibliográfico Oficial • 12 MB" />
                </div>
              )}

              {activeCourseTab === 'eval' && currentChapter.quiz && (
                <div className="bg-black/30 border border-barcelo-gold p-6 rounded-lg">
                  <div className="text-[0.7rem] text-barcelo-gold font-bold tracking-widest mb-4 border-b border-white/10 pb-2 uppercase">Evaluación Rígida Múltiple Choice</div>
                  <p className="text-lg font-semibold mb-6">{currentChapter.quiz.question}</p>
                  <div className="space-y-3">
                    {currentChapter.quiz.options.map((opt, i) => (
                      <div key={i}>
                        <QuizOption label={opt.text} correct={opt.isCorrect} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-mut border-2 border-dashed border-white/10 rounded-xl">
              <Brain size={48} className="mb-4 opacity-20" />
              <p>No hay contenido disponible para esta sección.</p>
              {user.isAdmin && <p className="text-xs mt-2">Usa el Motor IA arriba para generar materias.</p>}
            </div>
          )}

          {activeView === 'biblioteca' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h1 className="font-serif text-4xl text-barcelo-gold">Biblioteca Virtual Universitaria</h1>
                  <p className="text-text-mut">Acervo Oficial Cortex vinculado a BooksMédicos.</p>
                </div>
                <input type="text" placeholder="Buscar libro..." className="bg-black/30 border border-white/10 rounded-full px-5 py-2 outline-none focus:border-barcelo-gold w-full md:w-64" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <BookCard title="Harrison: Principios de Medicina Interna" author="Loscalzo, Fauci, Kasper" color="bordeaux" />
                <BookCard title="Farreras - Rozman: Medicina Interna" author="C. Rozman, F. Cardellach" />
                <BookCard title="Netter: Atlas de Anatomía Humana" author="Frank H. Netter" color="gold" />
                <BookCard title="Robbins y Cotran: Patología Estructural" author="Kumar, Abbas, Aster" color="bordeaux" />
              </div>
            </motion.div>
          )}

          {activeView === 'podcast' && currentChapter && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 h-full flex flex-col">
              <div className="flex flex-col lg:flex-row gap-8 flex-1">
                <div className="flex-[2] space-y-6 overflow-hidden flex flex-col">
                  <h1 className="font-serif text-3xl">{currentChapter.title} <span className="text-barcelo-gold">[ IA Model ]</span></h1>
                  <div className="w-full min-h-[350px] bg-gradient-to-b from-slate-950 to-bg-surf border border-barcelo-gold rounded-xl relative flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,21,56,0.2)_0%,transparent_60%)]" />
                    <div className="flex items-center justify-center gap-2 h-24 z-10">
                      {[...Array(7)].map((_, i) => (
                        <motion.span 
                          key={i} 
                          animate={{ scaleY: [0.2, 1, 0.2] }} 
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          className={`w-2 rounded-full ${i % 3 === 0 ? 'bg-barcelo-gold shadow-[0_0_15px_var(--color-barcelo-gold)]' : i % 3 === 1 ? 'bg-barcelo-bordeaux shadow-[0_0_15px_var(--color-barcelo-bordeaux)]' : 'bg-barcelo-blue shadow-[0_0_15px_var(--color-barcelo-blue)]'}`}
                          style={{ height: `${[20, 50, 90, 120, 90, 50, 20][i]}px` }}
                        />
                      ))}
                    </div>
                    <button className="absolute bottom-5 left-5 bg-barcelo-gold text-barcelo-blue w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(194,164,96,0.5)] z-20"><Play fill="currentColor" /></button>
                    <div className="absolute top-5 right-5 bg-barcelo-blue/80 px-3 py-1 rounded-full border border-barcelo-blue text-[0.6rem] tracking-widest text-white z-20">TRANSMISIÓN NEURAL</div>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-black/40 border border-white/10 rounded-lg p-6 font-sans leading-relaxed text-text-mut" dangerouslySetInnerHTML={{ __html: currentChapter.transcript }} />
                </div>
                <div className="flex-1 bg-bg-surf border border-white/10 rounded-xl flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-white/10 bg-black/50">
                    <h3 className="font-serif text-xl">Capítulos del Módulo</h3>
                    <p className="text-barcelo-gold text-xs">Generados por el Motor IA</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chapters.map((chap) => (
                      <div 
                        key={chap.id} 
                        onClick={() => setCurrentChapter(chap)}
                        className={`p-4 rounded-lg cursor-pointer transition-all border ${chap.id === currentChapter.id ? 'bg-barcelo-bordeaux/15 border-barcelo-bordeaux' : 'border-white/10 opacity-80 hover:bg-white/5'}`}
                      >
                        <div className="text-[0.7rem] font-bold text-barcelo-gold mb-2 uppercase">{chap.id === currentChapter.id && '• EN CURSO'}</div>
                        <div className="font-semibold text-sm mb-1">{chap.title}</div>
                        <div className="text-xs text-text-mut">ERA 1 Ready • {chap.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Widget */}
        <div className="fixed bottom-8 right-8 z-[60]">
          <button 
            onClick={() => setIsAIOpen(!isAIOpen)}
            className="bg-gradient-to-br from-barcelo-blue to-barcelo-bordeaux text-white px-6 py-4 rounded-full flex items-center gap-3 font-semibold font-serif border border-barcelo-gold shadow-2xl hover:-translate-y-1 transition-transform group"
          >
            <Brain className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
            Cortex IA
          </button>

          <AnimatePresence>
            {isAIOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-bg-main/95 backdrop-blur-xl border border-barcelo-gold/40 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-barcelo-blue to-barcelo-bordeaux/80 border-b-2 border-barcelo-gold flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif font-semibold text-white">
                      {aiMode === 'strict' ? 'Cortex M-1' : 'X-Omega'}
                      <span className="text-[0.6rem] bg-black/30 px-2 py-0.5 rounded text-barcelo-gold uppercase tracking-widest">
                        {aiMode === 'strict' ? 'Rigor Clínico' : 'IA Libre'}
                      </span>
                    </div>
                    <button onClick={() => setIsAIOpen(false)} className="text-white hover:text-barcelo-gold"><X size={24} /></button>
                  </div>
                  <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                    <button 
                      onClick={() => setAiMode('strict')}
                      className={`flex-1 py-1 text-[0.65rem] font-bold rounded-full transition-all ${aiMode === 'strict' ? 'bg-barcelo-bordeaux text-white' : 'text-text-mut'}`}
                    >
                      FARRERAS (ACADÉMICO)
                    </button>
                    <button 
                      onClick={() => setAiMode('unfiltered')}
                      className={`flex-1 py-1 text-[0.65rem] font-bold rounded-full transition-all ${aiMode === 'unfiltered' ? 'bg-barcelo-blue text-barcelo-gold shadow-inner' : 'text-text-mut'}`}
                    >
                      X-OMEGA (SIN FILTRO)
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 min-w-[8 corner] rounded-full flex items-center justify-center font-serif text-sm border ${msg.role === 'bot' ? 'bg-barcelo-gold/20 border-barcelo-gold text-barcelo-gold' : 'bg-barcelo-blue/30 border-barcelo-blue text-white'}`}>
                        {msg.role === 'bot' ? 'C' : 'U'}
                      </div>
                      <div className={`p-3 rounded-xl text-sm leading-relaxed border ${msg.role === 'bot' ? 'bg-white/5 border-white/10 rounded-tl-none' : 'bg-barcelo-blue/40 border-barcelo-blue rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm border bg-barcelo-gold/20 border-barcelo-gold text-barcelo-gold">C</div>
                      <div className="p-3 rounded-xl bg-white/5 border-white/10 rounded-tl-none flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-barcelo-gold rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-barcelo-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-barcelo-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-black/50 border-t border-white/10 flex gap-2">
                  <input 
                    type="text" 
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendAIMessage()}
                    placeholder="Haz tu consulta médica..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-barcelo-gold transition-all"
                  />
                  <button onClick={sendAIMessage} className="bg-barcelo-bordeaux text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-barcelo-gold hover:text-black transition-all">
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function MenuItem({ active, icon, label, onClick }: { active?: boolean, icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-3 text-sm transition-all border-l-4 ${active ? 'bg-barcelo-bordeaux/15 border-barcelo-bordeaux text-barcelo-gold' : 'border-transparent text-text-main hover:bg-white/5'}`}
    >
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}

function Tab({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 px-4 text-sm font-medium border-b-2 transition-all ${active ? 'text-barcelo-gold border-barcelo-gold' : 'text-text-mut border-transparent hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function MaterialCard({ title, details }: { title: string, details: string }) {
  return (
    <div className="bg-bg-surf border border-white/10 p-4 rounded-lg flex items-center justify-between group hover:border-barcelo-gold transition-all">
      <div className="flex items-center gap-4">
        <div className="text-2xl">📄</div>
        <div>
          <div className="font-medium text-sm group-hover:text-barcelo-gold transition-colors">{title}</div>
          <div className="text-xs text-text-mut mt-0.5">{details}</div>
        </div>
      </div>
      <button className="bg-barcelo-blue text-white px-4 py-2 rounded text-xs font-bold hover:bg-barcelo-gold hover:text-barcelo-blue transition-all">Descargar PDF</button>
    </div>
  );
}

function QuizOption({ label, correct }: { label: string, correct?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  return (
    <div 
      onClick={() => setStatus(correct ? 'correct' : 'wrong')}
      className={`p-4 border rounded-lg cursor-pointer transition-all text-sm ${
        status === 'idle' ? 'bg-white/5 border-white/10 hover:border-barcelo-gold hover:translate-x-1' :
        status === 'correct' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'
      }`}
    >
      {label}
    </div>
  );
}

function BookCard({ title, author, color }: { title: string, author: string, color?: 'bordeaux' | 'gold' }) {
  return (
    <div className="bg-bg-surf border border-white/10 rounded-lg overflow-hidden flex flex-col group hover:-translate-y-1 hover:border-barcelo-gold transition-all">
      <div className={`h-48 flex flex-col items-center justify-center p-5 text-center relative border-b-2 ${
        color === 'bordeaux' ? 'bg-gradient-to-br from-barcelo-bordeaux to-[#2d0510] border-barcelo-gold' :
        color === 'gold' ? 'bg-gradient-to-br from-[#7c6126] to-[#3b2c0f] border-barcelo-blue' :
        'bg-gradient-to-br from-barcelo-blue to-[#020617] border-barcelo-bordeaux'
      }`}>
        <div className="absolute top-2 right-2 bg-black/60 text-[0.6rem] px-2 py-0.5 rounded border border-white/20">PDF / EPUB</div>
        <div className="text-3xl mb-2 opacity-80">📖</div>
        <div className="text-[0.6rem] uppercase tracking-widest opacity-70 mb-1">Edición Oficial</div>
        <div className="font-serif font-bold text-sm leading-tight text-white">{title}</div>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[0.7rem] font-bold text-barcelo-gold mb-1">{author}</div>
          <div className="text-[0.75rem] text-text-mut line-clamp-2">Literatura fundamental para el ciclo clínico.</div>
        </div>
        <button className="w-full bg-barcelo-blue/50 border border-barcelo-blue text-white py-2 rounded text-xs uppercase tracking-wider mt-4 hover:bg-barcelo-bordeaux hover:border-barcelo-bordeaux transition-all">Abrir Lector</button>
      </div>
    </div>
  );
}
