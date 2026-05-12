import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Layout, 
  BarChart2, 
  User, 
  Tag, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Status, UserStory, Sprint, BurndownData } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_STORIES: UserStory[] = [
  {
    id: '1',
    title: 'Autenticación de Usuario',
    description: 'Como usuario, necesito iniciar sesión, para acceder a mis datos privados.',
    acceptanceCriteria: 'Dado que estoy en la página de login, cuando ingreso mis credenciales, entonces accedo al panel principal.',
    status: 'Backlog',
    estimate: 5,
    labels: ['auth', 'core'],
    assignee: '',
  },
  {
    id: '2',
    title: 'Creación de Perfil',
    description: 'Como usuario nuevo, necesito crear un perfil, para personalizar mi experiencia.',
    acceptanceCriteria: 'Dado un formulario válido, cuando se envía, entonces se crea el registro en la DB.',
    status: 'Sprint Backlog',
    estimate: 3,
    labels: ['profile'],
    assignee: '',
  },
  {
    id: '3',
    title: 'Dashboard de Actividad',
    description: 'Como analista, necesito ver mis tareas, para gestionar mi tiempo mejor.',
    acceptanceCriteria: 'Dado datos de tareas, cuando cargo el dashboard, entonces veo una lista actualizada.',
    status: 'In Progress',
    estimate: 8,
    labels: ['ui', 'deuda técnica'],
    assignee: 'Mi Usuario',
    isTechnicalDebt: true,
  }
];

const INITIAL_SPRINT: Sprint = {
  id: 'sprint-1',
  name: 'Sprint 1: Cimiento del Proyecto',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  totalPoints: 20
};

export default function App() {
  const [stories, setStories] = useState<UserStory[]>(() => {
    const saved = localStorage.getItem('agile-stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });
  const [sprint, setSprint] = useState<Sprint>(() => {
    const saved = localStorage.getItem('agile-sprint');
    return saved ? JSON.parse(saved) : INITIAL_SPRINT;
  });
  const [activeTab, setActiveTab] = useState<'board' | 'burndown'>('board');
  const [isAddingStory, setIsAddingStory] = useState(false);

  useEffect(() => {
    localStorage.setItem('agile-stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('agile-sprint', JSON.stringify(sprint));
  }, [sprint]);

  const moveStory = (id: string, newStatus: Status) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const deleteStory = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
  };

  const addStory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStory: UserStory = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      acceptanceCriteria: formData.get('acceptanceCriteria') as string,
      status: 'Backlog',
      estimate: Number(formData.get('estimate')),
      labels: (formData.get('labels') as string).split(',').map(l => l.trim()).filter(Boolean),
      assignee: '',
      isTechnicalDebt: formData.get('isTechnicalDebt') === 'on'
    };
    setStories(prev => [...prev, newStory]);
    setIsAddingStory(false);
  };

  const burndownData = useMemo(() => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const data = [];
    let remaining = sprint.totalPoints;
    const dailyIdeal = sprint.totalPoints / days;

    for (let i = 0; i <= days; i++) {
        const currentDataPoint = {
            day: `Día ${i}`,
            ideal: Math.max(0, Number((sprint.totalPoints - (dailyIdeal * i)).toFixed(1))),
            actual: i === 0 ? sprint.totalPoints : undefined
        };
        
        if (i > 0 && i <= 3) {
            remaining -= (Math.random() * 3 + 1);
            (currentDataPoint as any).actual = Math.max(0, Number(remaining.toFixed(1)));
        }
        data.push(currentDataPoint);
    }
    return data;
  }, [sprint]);

  const columns: { title: Status; icon: any; color: string }[] = [
    { title: 'Backlog', icon: Clock, color: 'text-slate-500 border-slate-200' },
    { title: 'Sprint Backlog', icon: AlertCircle, color: 'text-blue-500 border-blue-200' },
    { title: 'In Progress', icon: Layout, color: 'text-amber-500 border-amber-200' },
    { title: 'Done', icon: CheckCircle2, color: 'text-emerald-500 border-emerald-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
              <Layout className="w-8 h-8 text-blue-600" />
              {sprint.name}
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {sprint.startDate} — {sprint.endDate} | {sprint.totalPoints} Puntos Totales
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('board')}
              className={cn(
                "px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm",
                activeTab === 'board' ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Layout className="w-4 h-4" /> Tablero Kanban
            </button>
            <button 
              onClick={() => setActiveTab('burndown')}
              className={cn(
                "px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm",
                activeTab === 'burndown' ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <BarChart2 className="w-4 h-4" /> Gráfico Burndown
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <div className={cn("flex items-center justify-between pb-3 border-b-2", col.color)}>
                  <h2 className="font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                    <col.icon className="w-4 h-4" />
                    {col.title}
                    <span className="ml-2 bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-mono text-[10px]">
                      {stories.filter(s => s.status === col.title).length}
                    </span>
                  </h2>
                  {col.title === 'Backlog' && (
                    <button 
                      onClick={() => setIsAddingStory(true)}
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-4 min-h-[500px]">
                  <AnimatePresence mode="popLayout">
                    {stories.filter(s => s.status === col.title).map((story) => (
                      <motion.div
                        layout
                        key={story.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {story.isTechnicalDebt && (
                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase rounded-bl-lg border-l border-b border-rose-100">
                            Deuda Técnica
                          </div>
                        )}
                        <h3 className="font-semibold text-slate-900 mb-2 leading-tight pr-12">{story.title}</h3>
                        <p className="text-slate-500 text-[11px] mb-3 line-clamp-2 italic leading-relaxed">
                          "{story.description}"
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {story.labels.map(label => (
                            <span key={label} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                              <Tag className="w-3 h-3 opacity-50" /> {label}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                              {story.estimate}
                            </div>
                            {story.assignee && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                <User className="w-3 h-3" /> {story.assignee}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <select 
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 cursor-pointer outline-none hover:bg-white transition-colors"
                              value={story.status}
                              onChange={(e) => moveStory(story.id, e.target.value as Status)}
                            >
                              {columns.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                            </select>
                            <button 
                              onClick={() => deleteStory(story.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-blue-600" />
                        Diagrama de Trabajo Pendiente (Burndown Chart)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Progreso visual del Sprint actual vs Planificación Ideal.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Velocidad</p>
                        <p className="text-lg font-bold">4.2 pts/día</p>
                    </div>
                </div>
            </div>
            
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94A3B8' }} 
                        dy={10} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94A3B8' }} 
                        dx={-10} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    />
                    <Legend 
                        iconType="circle" 
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} 
                    />
                    <Line 
                        name="Línea Ideal"
                        type="monotone" 
                        dataKey="ideal" 
                        stroke="#CBD5E1" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1500}
                    />
                    <Line 
                        name="Progreso Real"
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#2563EB" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        animationDuration={1000}
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Completado</p>
                <p className="text-2xl font-bold text-emerald-900">35%</p>
                <div className="w-full bg-emerald-200 h-1 rounded-full mt-2">
                    <div className="bg-emerald-600 h-1 rounded-full w-[35%]"></div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Días Restantes</p>
                <p className="text-2xl font-bold text-blue-900">9</p>
                <p className="text-[10px] text-blue-600 mt-1">De un total de 14 días</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 uppercase mb-1">Puntos Restantes</p>
                <p className="text-2xl font-bold text-amber-900">
                    {stories.filter(s => s.status !== 'Done').reduce((acc, s) => acc + s.estimate, 0)}
                </p>
                <p className="text-[10px] text-amber-600 mt-1">Pendiente en el backlog</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Nueva Historia */}
      {isAddingStory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Nueva Historia</h2>
              <button 
                onClick={() => setIsAddingStory(false)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={addStory} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título de la Tarea</label>
                <input required name="title" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Ej: CRUD de Usuarios" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Historia (Plantilla "Como... Necesito... Para que...")</label>
                <textarea required name="description" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Como administrador, necesito..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Criterios de Aceptación (Gherkin "Dado... Cuando... Entonces...")</label>
                <textarea required name="acceptanceCriteria" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm resize-none" placeholder="Dado que el usuario..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Estimación (SP)</label>
                  <input required name="estimate" type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="3" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Etiquetas</label>
                  <input name="labels" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="ui, feature" />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" name="isTechnicalDebt" className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500" />
                <div>
                    <p className="text-sm font-semibold text-slate-700">Deuda Técnica</p>
                    <p className="text-[10px] text-slate-500">Marcar si esta tarea es una mejora técnica o refactorización.</p>
                </div>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingStory(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200">
                  Guardar Historia
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Info */}
      <footer className="fixed bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <div className="bg-white/80 backdrop-blur border border-slate-200 px-4 py-2 rounded-full shadow-lg pointer-events-auto flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            V1.0 Agile Dashboard
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <span className="hidden md:inline">Perfecto para tareas de Coursera Final Project</span>
        </div>
      </footer>
    </div>
  );
}
