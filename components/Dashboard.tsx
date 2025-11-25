
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ElementData, InstallationType, MonthlyArchive, MonthlyPlan } from '../types';
import { SECTORS, INSTALLATION_TYPES } from '../constants';

interface Props {
  elements: ElementData[];
  archives: MonthlyArchive[];
  plans: MonthlyPlan[];
  sector: string;
  onClose: () => void;
  onValidateMonth: (month: number, year: number, currentStatuses: {id: string, status: 'PENDING'|'COMPLETED'}[]) => void;
  onUpdateMonthlyPlan: (month: number, year: number, elementIds: string[]) => void;
}

export const Dashboard: React.FC<Props> = ({ elements, archives, plans, sector, onClose, onValidateMonth, onUpdateMonthlyPlan }) => {
  const [view, setView] = useState<'DASHBOARD' | 'MONTHLY'>('DASHBOARD');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showEditList, setShowEditList] = useState(false);

  // 1. Chart Data Preparation
  const chartData = Object.values(InstallationType).map(type => {
      const relevantElements = elements.filter(e => e.type === type && e.sector === sector);
      const total = relevantElements.length;
      const completed = relevantElements.filter(e => !e.isPendingMonthly).length;
      const pending = total - completed;
      return {
          name: type.substring(0, 15),
          total,
          completed,
          pending,
          fraction: `${completed}/${total}`,
          pctCompleted: total > 0 ? (completed / total) * 100 : 0,
          pctPending: total > 0 ? (pending / total) * 100 : 0,
      };
  });

  // 2. Monthly List Logic
  const archive = archives.find(a => a.month === month && a.year === year && a.sector === sector);
  const plan = plans.find(p => p.month === month && p.year === year && p.sector === sector);

  let displayedElements: ElementData[] = [];
  
  if (archive) {
      displayedElements = elements.filter(e => archive.snapshots.some(s => s.elementId === e.id));
  } else if (plan) {
      displayedElements = elements.filter(e => plan.elementIds.includes(e.id));
  } else {
      displayedElements = [];
  }

  const getElementStatus = (el: ElementData) => {
      if (archive) {
          const rec = archive.snapshots.find(s => s.elementId === el.id);
          return rec ? (rec.status === 'COMPLETED' ? 'Completado' : 'Pendiente') : 'N/A';
      }
      return el.isPendingMonthly ? 'Pendiente' : 'Completado';
  };

  const currentProgress = () => {
      if (archive) {
          const total = archive.snapshots.length;
          const completed = archive.snapshots.filter(s => s.status === 'COMPLETED').length;
          return total > 0 ? Math.round((completed / total) * 100) : 0;
      }
      if (displayedElements.length === 0) return 0;
      
      const total = displayedElements.length;
      const completed = displayedElements.filter(e => !e.isPendingMonthly).length;
      return Math.round((completed / total) * 100);
  };

  const handleValidate = () => {
      if (displayedElements.length === 0) {
          alert("No hay elementos en la lista para validar.");
          return;
      }
      if (confirm(`¿Validar mantenimiento de ${month + 1}/${year}? Se guardará el estado actual y se reiniciarán los checks.`)) {
          const snapshots = displayedElements.map(e => ({
              id: e.id,
              status: !e.isPendingMonthly ? 'COMPLETED' as const : 'PENDING' as const
          }));
          onValidateMonth(month, year, snapshots);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white w-[95%] h-[90%] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        <div className="bg-[#006338] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex gap-4">
                <button onClick={() => setView('DASHBOARD')} className={`font-bold px-4 py-2 rounded ${view==='DASHBOARD' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Dashboard Semestral</button>
                <button onClick={() => setView('MONTHLY')} className={`font-bold px-4 py-2 rounded ${view==='MONTHLY' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Mantenimiento Mensual</button>
            </div>
            <button onClick={onClose} className="font-bold text-xl w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full">✕</button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
            {view === 'DASHBOARD' && (
                <div className="h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Progreso Semestral ({sector})</h2>
                    <div className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={chartData} 
                                layout="vertical" 
                                margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                                stackOffset="expand" // Makes it 100% stacked
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={150} 
                                    tick={({ x, y, payload }) => {
                                        const item = chartData.find(d => d.name === payload.value);
                                        return (
                                            <g transform={`translate(${x},${y})`}>
                                                <text x={-10} y={-5} dy={0} textAnchor="end" fill="#333" className="text-xs font-bold">{payload.value}</text>
                                                <text x={-10} y={10} dy={0} textAnchor="end" fill="#666" className="text-xs">{item?.fraction}</text>
                                            </g>
                                        )
                                    }}
                                />
                                <Tooltip formatter={(value: any, name: any, props: any) => {
                                    if (name === 'Completados') return [props.payload.completed, name];
                                    if (name === 'Pendientes') return [props.payload.pending, name];
                                    return [value, name];
                                }}/>
                                <Legend />
                                <Bar dataKey="pctCompleted" name="Completados" fill="#006338" stackId="a" />
                                <Bar dataKey="pctPending" name="Pendientes" fill="#e5e7eb" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {view === 'MONTHLY' && (
                <div className="flex flex-col h-full">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Lista Mensual {archive ? <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded border border-orange-200">VALIDADO (Solo Lectura)</span> : <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">EN CURSO</span>}
                        </h2>
                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border">
                            <select 
                                className="border border-gray-300 rounded p-2 font-bold text-gray-700" 
                                value={year} 
                                onChange={(e) => setYear(parseInt(e.target.value))}
                            >
                                {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <select 
                                className="border border-gray-300 rounded p-2 font-bold text-gray-700" 
                                value={month} 
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                            >
                                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-2">
                            {!archive && (
                                <>
                                    <button onClick={() => setShowEditList(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold shadow">
                                        Editar Lista
                                    </button>
                                    <button onClick={handleValidate} className="bg-[#006338] text-white px-4 py-2 rounded hover:bg-[#004f2d] font-bold shadow">
                                        Validar Mantenimiento
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1 font-bold text-gray-600">
                            <span>Progreso Mensual del Sector</span>
                            <span>{currentProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-[#006338] h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-white text-xs font-bold" 
                                style={{ width: `${currentProgress()}%` }}
                            >
                                {currentProgress()}%
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-auto border rounded-lg shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700">
                                <tr>
                                    <th className="p-3 border-b">Estación</th>
                                    <th className="p-3 border-b">Instalación</th>
                                    <th className="p-3 border-b">Elemento</th>
                                    <th className="p-3 border-b text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedElements.length > 0 ? displayedElements.map(el => {
                                    const status = getElementStatus(el);
                                    return (
                                        <tr key={el.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-sm">{el.station}</td>
                                            <td className="p-3 text-sm text-gray-600">{el.type}</td>
                                            <td className="p-3 font-bold text-gray-800">{el.name}</td>
                                            <td className="p-3 text-center">
                                                {status === 'Pendiente' ? (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200">Pendiente</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-200">Completado</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                            Lista vacía. Pulsa "Editar Lista" para añadir elementos a este mes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>

      {showEditList && (
          <EditListModal 
            sector={sector} 
            elements={elements} 
            preselectedIds={plan ? plan.elementIds : (archive ? archive.snapshots.map(s => s.elementId) : [])}
            onClose={() => setShowEditList(false)} 
            onSave={(ids) => { onUpdateMonthlyPlan(month, year, ids); setShowEditList(false); }}
          />
      )}
    </div>
  );
};

const EditListModal: React.FC<{ 
    sector: string, 
    elements: ElementData[], 
    preselectedIds: string[],
    onClose: () => void, 
    onSave: (ids: string[]) => void 
}> = ({ sector, elements, preselectedIds, onClose, onSave }) => {
    const [step, setStep] = useState<'STATIONS' | 'TYPES' | 'LIST'>('STATIONS');
    const [selectedStation, setSelectedStation] = useState('');
    const [selectedType, setSelectedType] = useState<InstallationType | ''>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preselectedIds));

    const stations = SECTORS[sector] || [];

    const toggleId = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBack = () => {
        if (step === 'LIST') setStep('TYPES');
        else if (step === 'TYPES') setStep('STATIONS');
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="bg-white w-[900px] h-[800px] rounded-xl flex flex-col shadow-2xl">
                 <div className="bg-blue-700 p-4 rounded-t-xl text-white flex justify-between items-center relative">
                    <div className="flex items-center">
                        {step !== 'STATIONS' && (
                            <button onClick={handleBack} className="mr-4 bg-white/20 hover:bg-white/30 rounded-full p-1">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                        )}
                        <h2 className="text-xl font-bold">
                            {step === 'STATIONS' ? `Seleccionar Estación - ${sector}` : 
                             step === 'TYPES' ? `Seleccionar Instalación - ${selectedStation}` :
                             `${selectedType} en ${selectedStation}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-2xl">×</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    
                    {/* STEP 0: STATIONS GRID */}
                    {step === 'STATIONS' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {stations.map(st => (
                                <button
                                    key={st}
                                    onClick={() => { setSelectedStation(st); setStep('TYPES'); }}
                                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg hover:bg-blue-50 border transition-all font-bold text-lg text-gray-700 flex items-center justify-center text-center h-32"
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STEP 1: TYPES GRID */}
                    {step === 'TYPES' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {INSTALLATION_TYPES.map(t => {
                                // Count elements in this station/type
                                const count = elements.filter(e => e.station === selectedStation && e.type === t).length;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => { setSelectedType(t); setStep('LIST'); }}
                                        className={`p-6 rounded-xl shadow border transition-all font-bold text-gray-700 flex flex-col items-center justify-center text-center h-32 ${count > 0 ? 'bg-white hover:bg-blue-50 hover:shadow-lg cursor-pointer' : 'bg-gray-100 opacity-50 cursor-not-allowed'}`}
                                        disabled={count === 0}
                                    >
                                        <span className="text-lg mb-2">{t}</span>
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{count} Elementos</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* STEP 2: LIST */}
                    {step === 'LIST' && (
                        <div>
                            <div className="mb-4 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Marque los elementos a incluir en el plan mensual:</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            const subset = elements.filter(e => e.station === selectedStation && e.type === selectedType);
                                            const newSet = new Set(selectedIds);
                                            subset.forEach(s => newSet.add(s.id));
                                            setSelectedIds(newSet);
                                        }}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Seleccionar Todos
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow border divide-y">
                                {elements.filter(e => e.station === selectedStation && e.type === selectedType).map(el => (
                                    <label key={el.id} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.has(el.id)}
                                            onChange={() => toggleId(el.id)}
                                        />
                                        <span className="ml-4 font-bold text-gray-800">{el.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t flex justify-between gap-4 bg-gray-100 rounded-b-xl items-center">
                    <div className="text-sm text-gray-600">
                        <strong>{selectedIds.size}</strong> elementos seleccionados en total (todo el sector)
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="text-gray-600 font-bold hover:text-gray-800 px-4">Cancelar</button>
                        <button onClick={() => onSave(Array.from(selectedIds))} className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 shadow">
                            Guardar Lista Completa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
