import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, X, ChevronRight, BookOpen, Brain, Stethoscope, Activity, Globe } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', token: '' });

  useEffect(() => {
    if (localStorage.getItem('cortex_logged_in') === 'true') {
      navigate('/platform');
    }
  }, [navigate]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      const isAdmin = (formData.email === 'atlascortexmed@gmail.com');
      const isValidToken = (formData.token.toUpperCase() === 'CORTEX-2026');
      if (!isAdmin && !isValidToken) {
        alert("🚫 REGISTRO DENEGADO.\nEl Token de Autorización provisto es inválido o expiró.");
        return;
      }
      localStorage.setItem('cortex_name', formData.name || formData.email.split('@')[0]);
    } else {
      if (!localStorage.getItem('cortex_name')) {
        localStorage.setItem('cortex_name', formData.email.split('@')[0]);
      }
    }
    localStorage.setItem('cortex_logged_in', 'true');
    localStorage.setItem('cortex_email', formData.email);
    navigate('/platform');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="bg-ambient" />
      <div className="bg-grid" />

      {/* Top Bar */}
      <div className="bg-barcelo-bordeaux py-2 px-[4%] flex justify-end gap-6 text-[0.75rem] tracking-widest uppercase border-b-2 border-barcelo-gold">
        <div className="flex items-center gap-6">
          <a href="#" className="text-white opacity-90 hover:opacity-100 hover:text-barcelo-gold transition-opacity">
            <span className="animate-pulse bg-white/20 px-2 py-0.5 rounded font-bold mr-2">● LIVE</span> 
            Clases de Consulta
          </a>
          <a href="#" className="text-white opacity-90 hover:opacity-100 hover:text-barcelo-gold transition-opacity">Área do Aluno (SIGEDU)</a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-barcelo-blue border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center justify-between py-3 px-[4%] max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 bg-gradient-to-b from-barcelo-blue to-barcelo-bordeaux border-2 border-barcelo-gold relative flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-barcelo-gold">C</span>
            </div>
            <div className="leading-tight">
              <div className="font-serif text-2xl font-bold text-white">Instituto <i className="italic">Cortex</i></div>
              <div className="text-[0.65rem] text-barcelo-gold tracking-[0.15em] uppercase mt-0.5">Fundación Universitaria Barceló</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              className="border border-barcelo-gold text-barcelo-gold px-5 py-2 text-[0.8rem] font-semibold uppercase hover:bg-barcelo-gold hover:text-barcelo-blue transition-all"
            >
              Ingreso Online
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-32 px-[4%] flex items-center min-h-[85vh] border-b-2 border-barcelo-bordeaux bg-gradient-to-b from-barcelo-blue/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center z-10">
          <div className="text-barcelo-gold text-[0.85rem] font-semibold tracking-[0.15em] uppercase mb-6 flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-barcelo-gold" />
            Formación Médica 100% Digital
            <span className="w-10 h-px bg-barcelo-gold" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6 text-white font-semibold">
            El Conocimiento de la Fundación Barceló, <em className="italic text-barcelo-gold">ahora en línea.</em>
          </h1>
          <p className="text-lg md:text-xl text-text-mut mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Preparate desde el Pregrado (1° Año) hasta el IAR (7° Año) con la plataforma académica más avanzada. Aulas grabadas, resúmenes ultra-estruturados y evaluación continua para dominar la medicina.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              className="bg-barcelo-bordeaux text-white px-9 py-4 text-sm font-semibold uppercase tracking-wider border border-barcelo-bordeaux hover:bg-[#a31c44] hover:border-barcelo-gold transition-all shadow-lg hover:shadow-barcelo-bordeaux/40"
            >
              Conocer Plataforma
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="plataforma" className="py-24 px-[4%] bg-barcelo-blue/10 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Activity className="w-10 h-10 text-barcelo-gold" />, title: 'Aulas Clínicas Grabadas', desc: 'Biblioteca VOD en alta resolución.' },
              { icon: <BookOpen className="w-10 h-10 text-barcelo-gold" />, title: 'Resúmenes Atlas Cortex', desc: 'Apuntes oficiales en PDF. Cero paja.' },
              { icon: <Brain className="w-10 h-10 text-barcelo-gold" />, title: 'Banco de Preguntas', desc: 'Practicá con choices parciales (ERA 1, ERA 2).' },
              { icon: <Globe className="w-10 h-10 text-barcelo-gold" />, title: 'Aula Virtual Multi', desc: 'Estudiá desde tu notebook, tablet o móvil.' }
            ].map((feat, i) => (
              <div key={i} className="bg-barcelo-blue/20 border border-white/10 p-10 text-center hover:bg-barcelo-bordeaux/20 hover:border-barcelo-gold transition-all">
                <div className="flex justify-center mb-5 drop-shadow-[0_0_15px_rgba(194,164,96,0.4)]">{feat.icon}</div>
                <h3 className="text-white font-serif text-xl mb-4">{feat.title}</h3>
                <p className="text-text-mut text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-surf border border-barcelo-gold p-10 rounded-xl w-full max-w-md relative z-10 shadow-2xl"
            >
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-white hover:text-barcelo-gold transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="font-serif text-2xl text-white text-center mb-2">Admisión al Sistema</h2>
              <p className="text-xs text-barcelo-gold text-center mb-8 font-semibold tracking-wider uppercase">Fundación Cortex</p>

              <div className="flex mb-6 border-b border-white/10">
                <button 
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${authMode === 'register' ? 'text-barcelo-gold border-b-2 border-barcelo-gold' : 'text-text-mut hover:text-white'}`}
                >
                  Registrarse
                </button>
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${authMode === 'login' ? 'text-barcelo-gold border-b-2 border-barcelo-gold' : 'text-text-mut hover:text-white'}`}
                >
                  Iniciar Sesión
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <input 
                    type="text" 
                    placeholder="Nombre completo" 
                    required 
                    className="w-full bg-black/40 border border-white/10 text-white p-3 rounded focus:border-barcelo-bordeaux outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                )}
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  required 
                  className="w-full bg-black/40 border border-white/10 text-white p-3 rounded focus:border-barcelo-bordeaux outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  className="w-full bg-black/40 border border-white/10 text-white p-3 rounded focus:border-barcelo-bordeaux outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[0.7rem] text-text-mut uppercase font-semibold">Pase de Autorización *</label>
                    <input 
                      type="text" 
                      placeholder="Ej: CORTEX-2026" 
                      required 
                      className="w-full bg-black/40 border border-barcelo-gold text-barcelo-gold font-bold tracking-widest p-3 rounded outline-none transition-all"
                      value={formData.token}
                      onChange={e => setFormData({...formData, token: e.target.value})}
                    />
                  </div>
                )}
                <button type="submit" className="w-full bg-barcelo-bordeaux border border-barcelo-gold text-white py-4 font-bold uppercase rounded hover:bg-white hover:text-barcelo-bordeaux transition-all mt-4">
                  {authMode === 'register' ? 'Validar y Crear Cuenta' : 'Entrar al Campus'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-bg-surf py-20 px-[4%] border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-text-mut text-sm max-w-2xl mx-auto leading-relaxed">
            &copy; 2026 Plataforma e-Learning Atlas Cortex.
          </p>
        </div>
      </footer>
    </div>
  );
}
