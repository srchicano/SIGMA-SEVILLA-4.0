
import React, { useState, useEffect } from 'react';
import { InstallationType, ElementData, UserRole, NewElementData, Agent, FaultRecord } from '../types';
import { INSTALLATION_TYPES } from '../constants';

interface Props {
  element: ElementData;
  role: UserRole;
  isExpanded: boolean;
  assignedAgents: Agent[]; // Agents for this sector
  onToggleExpand: () => void;
  onToggleCheck: () => void;
  onUpdateParams: (params: Record<string, any>) => void;
  onRegisterMaintenance: (date: string, agents: string, values: Record<string, any>) => void;
}

export const ElementRow: React.FC<Props> = ({ 
  element, role, isExpanded, assignedAgents, onToggleExpand, onToggleCheck, onUpdateParams, onRegisterMaintenance
}) => {
  const canEdit = role === UserRole.ADMIN || role === UserRole.SUPERVISOR;
  const [isEditing, setIsEditing] = useState(false); // Edit Reference Params mode
  
  // State for editing detailed parameters
  const [editParams, setEditParams] = useState(element.params);
  
  // State for editing Summary parameters (Frequency, Date, Agents)
  const [editSummary, setEditSummary] = useState({
      frequency: element.params['frecuencia'] || '',
      lastMaintenance: element.lastMaintenance || '',
      completedBy: element.completedBy || ''
  });

  const [registerMode, setRegisterMode] = useState<'NONE' | 'MAINTENANCE' | 'FAULT'>('NONE');
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);

  useEffect(() => {
      setEditParams(element.params);
      setEditSummary({
          frequency: element.params['frecuencia'] || '',
          lastMaintenance: element.lastMaintenance || '',
          completedBy: element.completedBy || ''
      });
  }, [element]);

  const handleSaveParams = () => {
      const updatedParams = { ...editParams };
      if (element.type === InstallationType.CIRCUITOS) {
          updatedParams['frecuencia'] = editSummary.frequency;
      }
      
      onUpdateParams({
          ...updatedParams,
          _meta_lastMaintenance: editSummary.lastMaintenance,
          _meta_completedBy: editSummary.completedBy
      });
      
      setIsEditing(false);
  };

  return (
    // Added pb-14 to make space for the absolute button
    <div className="mb-4 bg-white rounded-xl shadow-lg border border-gray-200 relative overflow-visible flex flex-col pb-14">
      {/* Header Row */}
      <div className="p-5 flex flex-wrap md:flex-nowrap items-start justify-between bg-gray-50 gap-4 rounded-t-xl z-10 relative">
        
        <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
          <button 
            onClick={onToggleCheck}
            className={`shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${!element.isPendingMonthly ? 'bg-[#006338] border-[#006338]' : 'border-[#006338] bg-white hover:bg-green-50'}`}
            title={element.isPendingMonthly ? "Marcar como completado" : "Completado"}
          >
            {!element.isPendingMonthly && (
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 w-full">
              <h3 className="text-2xl font-bold text-gray-800 truncate min-w-[200px]">{element.name}</h3>
              
              {/* Summary Data */}
              <div className="flex-1">
                  <SummaryContent 
                    element={element} 
                    horizontal={true} 
                    isEditing={isEditing}
                    editValues={editSummary}
                    assignedAgents={assignedAgents}
                    onEditChange={(field, val) => setEditSummary(prev => ({...prev, [field]: val}))}
                  />
              </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0 relative">
           {isEditing ? (
               <button onClick={handleSaveParams} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow z-10">
                   Guardar
               </button>
           ) : (
               canEdit && (
                <button onClick={() => { setIsEditing(true); if(!isExpanded) onToggleExpand(); }} className="p-2 text-gray-600 hover:text-[#006338] hover:bg-green-100 rounded-lg transition-colors z-10" title="Editar">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )
           )}
          
          <div className="relative">
            <button 
                onClick={() => setShowRegisterOptions(!showRegisterOptions)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow transition-colors z-10 relative"
            >
                Registrar
            </button>
            
            {showRegisterOptions && (
                <div className="absolute top-0 right-full mr-2 flex gap-2 z-20 bg-white p-1 rounded-lg shadow-xl border border-gray-200 animate-in fade-in slide-in-from-right-2">
                    <button 
                        onClick={() => { setRegisterMode('MAINTENANCE'); setShowRegisterOptions(false); }} 
                        className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded whitespace-nowrap border border-blue-200"
                    >
                        Mantenimiento
                    </button>
                    <button 
                        onClick={() => { setRegisterMode('FAULT'); setShowRegisterOptions(false); }} 
                        className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded whitespace-nowrap border border-red-200"
                    >
                        Avería
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
         <div className="p-6 pt-4 bg-white border-t border-gray-200 relative">
             <div className="mt-2">
                 <h4 className="text-lg font-bold text-[#006338] mb-4 border-b pb-2">Parámetros Técnicos {isEditing && <span className="text-sm font-normal text-gray-500 ml-2">(Modo Edición)</span>}</h4>
                 <ExpandedContent 
                    type={element.type} 
                    isEditing={isEditing} 
                    values={isEditing ? editParams : element.params} 
                    onChange={(k, v) => setEditParams(prev => ({...prev, [k]: v}))}
                 />
             </div>

            <div className="mt-8 flex justify-start">
                 <button 
                    onClick={onToggleExpand}
                    className="bg-[#006338] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#004f2d] shadow-md transition-all"
                >
                    ▲ Ocultar Mantenimiento
                </button>
            </div>
         </div>
      )}

      {/* Show Expand button only if collapsed. Z-index 20 ensures it's above the container bg if needed, but below modals. */}
      {!isExpanded && (
          <button 
            onClick={onToggleExpand}
            className="absolute bottom-0 left-0 bg-[#006338] text-white text-sm font-bold px-6 py-3 rounded-tr-2xl z-20 hover:bg-[#004f2d] shadow-md transition-all"
          >
            ▼ Mantenimiento
          </button>
      )}

      {/* Modals */}
      {registerMode === 'MAINTENANCE' && (
          <MaintenanceFormModal 
            element={element} 
            assignedAgents={assignedAgents}
            onClose={() => setRegisterMode('NONE')} 
            onSubmit={onRegisterMaintenance}
          />
      )}
      {registerMode === 'FAULT' && (
          <FaultFormModal 
            element={element} 
            onClose={() => setRegisterMode('NONE')} 
          />
      )}

    </div>
  );
};

const MultiAgentSelect: React.FC<{
    assignedAgents: Agent[],
    value: string,
    onChange: (newVal: string) => void
}> = ({ assignedAgents, value, onChange }) => {
    const selectedNames = value ? value.split(', ').filter(s => s) : [];
    const [currentSelect, setCurrentSelect] = useState('');

    const handleAdd = () => {
        if (currentSelect && !selectedNames.includes(currentSelect)) {
            if (selectedNames.length >= 5) {
                alert("Máximo 5 agentes.");
                return;
            }
            const newNames = [...selectedNames, currentSelect];
            onChange(newNames.join(', '));
            setCurrentSelect('');
        }
    };

    const handleRemove = (name: string) => {
        const newNames = selectedNames.filter(n => n !== name);
        onChange(newNames.join(', '));
    };

    return (
        <div className="w-full">
            <div className="flex gap-2 mb-2">
                <select 
                    className="border border-gray-300 rounded p-1 text-sm font-bold text-gray-800 bg-white flex-1"
                    value={currentSelect}
                    onChange={(e) => setCurrentSelect(e.target.value)}
                >
                    <option value="">-- Seleccionar Agente --</option>
                    {assignedAgents.map(a => {
                        const fullName = a.name;
                        return <option key={a.id} value={fullName}>{fullName}</option>
                    })}
                </select>
                <button 
                    type="button" 
                    onClick={handleAdd} 
                    className="bg-blue-600 text-white px-3 rounded font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                    disabled={!currentSelect}
                >
                    +
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {selectedNames.map(name => (
                    <span key={name} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        {name}
                        <button 
                            type="button" 
                            onClick={() => handleRemove(name)} 
                            className="text-gray-500 hover:text-red-600 ml-1"
                        >
                            ×
                        </button>
                    </span>
                ))}
                {selectedNames.length === 0 && <span className="text-xs text-gray-400 italic">Ningún agente seleccionado</span>}
            </div>
        </div>
    );
};

const SummaryContent: React.FC<{ 
    element: ElementData, 
    horizontal?: boolean,
    isEditing?: boolean,
    editValues?: { frequency: string, lastMaintenance: string, completedBy: string },
    assignedAgents?: Agent[],
    onEditChange?: (field: string, val: string) => void
}> = ({ element, horizontal, isEditing, editValues, assignedAgents = [], onEditChange }) => {
  
  const items = [];
  
  if (element.type === InstallationType.CIRCUITOS) {
      items.push({ 
          label: 'Frecuencia', 
          key: 'frequency',
          val: element.params['frecuencia'] || '-' 
      });
  }
  items.push({ label: 'Fecha Mantenimiento', key: 'lastMaintenance', val: element.lastMaintenance || 'Pendiente' });
  items.push({ label: 'Completado por', key: 'completedBy', val: element.completedBy || '-' });

  return (
    <div className={`flex ${horizontal ? 'flex-row items-center gap-8' : 'flex-wrap gap-6'} text-sm h-full`}>
      {items.map((it, idx) => (
          <div key={idx} className="flex flex-col justify-center min-w-[120px]">
              <span className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">{it.label}</span>
              {isEditing && onEditChange && editValues ? (
                  it.key === 'completedBy' ? (
                      <div className="min-w-[200px]">
                        <MultiAgentSelect 
                            assignedAgents={assignedAgents} 
                            value={editValues.completedBy} 
                            onChange={(val) => onEditChange('completedBy', val)} 
                        />
                      </div>
                  ) : it.key === 'lastMaintenance' ? (
                      <input 
                        type="date" 
                        className="border border-gray-300 rounded p-1 text-sm font-bold text-gray-800 w-32"
                        value={editValues.lastMaintenance}
                        onChange={(e) => onEditChange('lastMaintenance', e.target.value)}
                      />
                  ) : (
                      <input 
                        type="text"
                        className="border border-gray-300 rounded p-1 text-sm font-bold text-gray-800 w-24"
                        value={(editValues as any)[it.key]}
                        onChange={(e) => onEditChange(it.key, e.target.value)}
                      />
                  )
              ) : (
                  // CHANGED: Removed truncate and max-w-[200px], added whitespace-normal break-words
                  <span className="font-bold text-gray-800 text-sm md:text-base break-words whitespace-normal block" title={it.val}>
                      {it.val}
                  </span>
              )}
          </div>
      ))}
    </div>
  );
};

const ParamColumn: React.FC<{ 
    title: string, 
    titleColor: string, 
    items: string[], 
    isEditing?: boolean, 
    values?: Record<string, any>,
    onChange?: (k: string, v: any) => void,
    readOnlyMode?: boolean 
}> = ({ title, titleColor, items, isEditing, values = {}, onChange, readOnlyMode }) => (
    <div className="flex flex-col bg-gray-50 p-3 rounded-lg h-full border border-gray-100">
        <h4 className={`font-bold mb-3 text-sm ${titleColor} border-b pb-1`}>{title}</h4>
        <div className="space-y-2">
            {items.map((item, i) => {
                const key = `${title}_${item}`.replace(/\s/g, ''); 
                return (
                    <div key={i} className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-1">
                        <span className="text-gray-600 text-xs font-medium mr-1">{item}</span>
                        <input 
                            disabled={!isEditing && !onChange} 
                            value={values[key] || ''}
                            onChange={(e) => onChange && onChange(key, e.target.value)}
                            className={`w-full xl:w-24 border rounded px-2 py-1 text-xs ${isEditing || (!readOnlyMode && onChange) ? 'bg-white border-gray-300 focus:ring-1 focus:ring-green-500' : 'bg-transparent border-transparent text-right font-bold text-gray-900'}`}
                            placeholder={isEditing ? "Ref..." : (readOnlyMode ? "-" : "...")} 
                        />
                    </div>
                )
            })}
        </div>
    </div>
);

const ExpandedContent: React.FC<{ 
    type: InstallationType, 
    isEditing?: boolean, 
    values?: Record<string, any>, 
    onChange?: (k: string, v: any) => void,
    readOnlyMode?: boolean
}> = (props) => {
  switch (props.type) {
    case InstallationType.CIRCUITOS:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
           <ParamColumn {...props} title="FILTRO" titleColor="text-orange-500" items={["3/4"]} />
           <ParamColumn {...props} title="RECEPTORES" titleColor="text-blue-600" items={["I1/2 ⊕1", "I1/2 ⊕2", "I1/2 ⊕3"]} />
           <ParamColumn {...props} title="RELÉS" titleColor="text-green-600" items={["I5/II8 ⊕1", "I5/II8 ⊕2", "I5/II8 ⊕3"]} />
           <ParamColumn {...props} title="SHUNT" titleColor="text-purple-600" items={["ASU", "Parásitas"]} />
           <ParamColumn {...props} title="COLATERALES" titleColor="text-red-600" items={["Col. ⊕1", "Col. ⊕2", "Col. ⊕3", "Col. ⭡"]} />
        </div>
      );
    case InstallationType.MOTORES:
       return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
           <ParamColumn {...props} title="Mov. a NORMAL" titleColor="text-green-600" items={["Tiempo + CG", "Tiempo + SG", "Intesidad + CG", "Intensidad + SG", "Tensión +"]} />
           <ParamColumn {...props} title="Mov. a INVERTIDO" titleColor="text-red-800" items={["Tiempo - CG", "Tiempo - SG", "Intesidad - CG", "Intensidad - SG", "Tensión -"]} />
        </div>
       );
    case InstallationType.SENALES:
        return <SignalsExpanded {...props} />;
    case InstallationType.PN:
    case InstallationType.BATERIAS:
    case InstallationType.ENCLAVAMIENTO:
        return (
            <div className="text-sm w-full md:w-1/3">
                <ParamColumn {...props} title="Contrata" titleColor="text-gray-800" items={["Valor"]} />
            </div>
        );
    default:
        return null;
  }
};

const SignalsExpanded: React.FC<any> = (props) => {
    return (
        <div className="space-y-6 text-sm">
            <div>
                <h4 className="font-bold text-blue-700 mb-2 border-b">FOCOS</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <ParamColumn {...props} title="TIPO" titleColor="text-blue-600" items={["Modular", "Ind.Normal", "LED"]} />
                    <ParamColumn {...props} title="ROJO" titleColor="text-red-600" items={["Ve Rojo", "V lamp R"]} />
                    <ParamColumn {...props} title="BLANCO" titleColor="text-gray-600" items={["Ve Blanco", "V lamp B"]} />
                    <ParamColumn {...props} title="VERDE" titleColor="text-green-600" items={["Ve Verde", "V lamp V"]} />
                    <ParamColumn {...props} title="AMARILLO" titleColor="text-yellow-600" items={["Ve Amar", "V lamp A"]} />
                </div>
            </div>
            <div>
                <h4 className="font-bold text-green-600 mb-2 border-b">UNIDAD DE CONEXIÓN</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ParamColumn {...props} title="UD CONEXION" titleColor="text-green-600" items={["UC"]} />
                     <ParamColumn {...props} title="SALIDA VERDE" titleColor="text-green-600" items={["TSB Verde","CompAlt V","Baliza V","Reparto"]} />
                     <ParamColumn {...props} title="SALIDA AMARILLO" titleColor="text-green-600" items={["TSB Amar","Relé Amar","CompAlt A","Baliza A","Reparto"]} />
                </div>
            </div>
             <div>
                <h4 className="font-bold text-orange-500 mb-2 border-b">BALIZA PIE SEÑAL</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {["L8", "L3", "L1"].map((l: string) => (
                       <ParamColumn {...props} key={l} title={l} titleColor="text-orange-500" items={["Desv F", "Desv %", "Altura"]} />
                   ))}
                   <ParamColumn {...props} title="CARRIL" titleColor="text-orange-500" items={["Dist. Carril", "Altura Carril"]} />
                </div>
            </div>
             <div>
                <h4 className="font-bold text-purple-600 mb-2 border-b">BALIZA PREVIA</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {["L7", "L3", "L1"].map((l: string) => (
                       <ParamColumn {...props} key={l} title={l} titleColor="text-purple-600" items={["Desv F", "Desv %", "Altura"]} />
                   ))}
                   <ParamColumn {...props} title="CARRIL" titleColor="text-purple-600" items={["Dist. Carril", "Altura Carril"]} />
                </div>
            </div>
        </div>
    );
}

const MaintenanceFormModal: React.FC<{ 
    element: ElementData, 
    assignedAgents: Agent[],
    onClose: () => void,
    onSubmit: (date: string, agents: string, values: Record<string, any>) => void
}> = ({ element, assignedAgents, onClose, onSubmit }) => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [agents, setAgents] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(date, agents, values);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm">
            <div className="bg-white w-[90%] max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
                <div className="bg-[#006338] p-4 rounded-t-xl text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Registrar Mantenimiento: {element.name}</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">×</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="maintForm" onSubmit={handleSubmit}>
                        <div className="mb-6">
                             <ExpandedContent 
                                type={element.type} 
                                values={values} 
                                onChange={(k, v) => setValues(p => ({...p, [k]: v}))} 
                             />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 border-t pt-6 bg-gray-50 p-4 rounded-lg">
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Mantenimiento</label>
                                 <input 
                                    type="date" 
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2"
                                 />
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-1">Completado por (Agentes)</label>
                                 <MultiAgentSelect 
                                    assignedAgents={assignedAgents}
                                    value={agents}
                                    onChange={setAgents}
                                 />
                             </div>
                        </div>
                    </form>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-bold">Cancelar</button>
                    <button type="submit" form="maintForm" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Guardar Registro</button>
                </div>
            </div>
        </div>
    );
};

const FaultFormModal: React.FC<{ element: ElementData, onClose: () => void }> = ({ element, onClose }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Avería registrada correctamente.");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] backdrop-blur-sm">
            <div className="bg-white w-[600px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
                <div className="bg-red-700 p-4 rounded-t-xl text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Registrar Avería: {element.name}</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">×</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="faultForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-bold text-sm text-gray-700 mb-1">Agentes</label>
                            <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500 outline-none" required />
                        </div>
                        <div>
                            <label className="block font-bold text-sm text-gray-700 mb-1">Descripción</label>
                            <textarea className="w-full border p-2 rounded h-20 resize-none focus:ring-2 focus:ring-red-500 outline-none" required></textarea>
                        </div>
                        <div>
                            <label className="block font-bold text-sm text-gray-700 mb-1">Causas</label>
                            <textarea className="w-full border p-2 rounded h-32 resize-none focus:ring-2 focus:ring-red-500 outline-none" required></textarea>
                        </div>
                         <div>
                            <label className="block font-bold text-sm text-gray-700 mb-1">Reparación</label>
                            <textarea className="w-full border p-2 rounded h-32 resize-none focus:ring-2 focus:ring-red-500 outline-none" required></textarea>
                        </div>
                    </form>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-bold">Cancelar</button>
                    <button type="submit" form="faultForm" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">Registrar Avería</button>
                </div>
            </div>
        </div>
    );
};

export const AddElementModal: React.FC<{ 
    sector: string, 
    stations: string[],
    onClose: () => void,
    onSubmit: (data: NewElementData) => void
}> = ({ sector, stations, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [station, setStation] = useState(stations[0] || '');
    const [type, setType] = useState<InstallationType>(INSTALLATION_TYPES[0] as InstallationType);
    const [params, setParams] = useState<Record<string, any>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, station, type, sector, params });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] backdrop-blur-sm">
            <div className="bg-white w-[900px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
                <div className="bg-[#006338] p-4 rounded-t-xl text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Añadir Nuevo Elemento - {sector}</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">×</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="addElementForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Elemento</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" placeholder="Ej: S1/2, CV-23..." />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Estación</label>
                                <select value={station} onChange={e => setStation(e.target.value)} className="w-full border p-2 rounded">
                                    {stations.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Instalación</label>
                                <select value={type} onChange={e => setType(e.target.value as InstallationType)} className="w-full border p-2 rounded">
                                    {INSTALLATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Parámetros de Referencia Iniciales</h3>
                            <ExpandedContent 
                                type={type} 
                                values={params} 
                                onChange={(k, v) => setParams(p => ({...p, [k]: v}))} 
                                isEditing={true}
                            />
                        </div>
                    </form>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-4 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold">Cancelar</button>
                    <button type="submit" form="addElementForm" className="px-6 py-2 bg-[#006338] text-white rounded hover:bg-[#004f2d] font-bold">Añadir Elemento</button>
                </div>
            </div>
        </div>
    );
}

export const HistoryModal: React.FC<{ 
    mode: 'MAINTENANCE' | 'FAULT', 
    elements: ElementData[], 
    onClose: () => void 
}> = ({ mode, elements, onClose }) => {
    const [selectedElementId, setSelectedElementId] = useState<string>('');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const selectedElement = elements.find(e => e.id === selectedElementId);
    const title = mode === 'MAINTENANCE' ? 'Datos Mantenimiento' : 'Datos Averías';
    const colorClass = mode === 'MAINTENANCE' ? 'bg-[#006338]' : 'bg-red-700';

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] backdrop-blur-sm">
            <div className="bg-white w-[90%] max-w-6xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className={`${colorClass} p-4 text-white flex justify-between items-center shrink-0`}>
                    <h2 className="text-xl font-bold">{title} - Histórico</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">×</button>
                </div>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Element Selector & List */}
                    <div className="w-1/3 border-r bg-gray-50 flex flex-col p-4">
                         <label className="text-sm font-bold text-gray-600 mb-2">Seleccionar Elemento:</label>
                         <select 
                            className="w-full p-2 border rounded mb-4"
                            value={selectedElementId}
                            onChange={(e) => { setSelectedElementId(e.target.value); setSelectedRecord(null); }}
                         >
                             <option value="">-- Seleccione --</option>
                             {elements.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                         </select>

                         {selectedElement && (
                             <div className="flex-1 overflow-y-auto bg-white border rounded">
                                 {mode === 'MAINTENANCE' ? (
                                     selectedElement.maintenanceHistory.length > 0 ? (
                                         selectedElement.maintenanceHistory.map(rec => (
                                             <button 
                                                key={rec.id} 
                                                onClick={() => setSelectedRecord(rec)}
                                                className={`w-full text-left p-3 border-b hover:bg-gray-100 ${selectedRecord?.id === rec.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                             >
                                                 <div className="font-bold">{rec.date}</div>
                                                 <div className="text-xs text-gray-500">Usuario: {rec.user}</div>
                                             </button>
                                         ))
                                     ) : <p className="p-4 text-gray-500 text-sm">Sin registros.</p>
                                 ) : (
                                     selectedElement.faultHistory.length > 0 ? (
                                          selectedElement.faultHistory.map(rec => (
                                             <button 
                                                key={rec.id} 
                                                onClick={() => setSelectedRecord(rec)}
                                                className={`w-full text-left p-3 border-b hover:bg-gray-100 ${selectedRecord?.id === rec.id ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                                             >
                                                 <div className="font-bold text-red-700">{rec.date}</div>
                                                 <div className="text-xs text-gray-600 truncate">{rec.description}</div>
                                             </button>
                                         ))
                                     ) : <p className="p-4 text-gray-500 text-sm">Sin averías.</p>
                                 )}
                             </div>
                         )}
                    </div>

                    {/* Main Content: Details */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {selectedRecord && selectedElement ? (
                            mode === 'MAINTENANCE' ? (
                                <div>
                                    <h3 className="text-2xl font-bold text-[#006338] mb-4">Registro del {selectedRecord.date}</h3>
                                    <div className="mb-6 p-4 bg-gray-100 rounded text-sm flex gap-8">
                                        <div><span className="font-bold">Usuario:</span> {selectedRecord.user}</div>
                                        <div><span className="font-bold">ID Registro:</span> {selectedRecord.id}</div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <ExpandedContent 
                                            type={selectedElement.type} 
                                            values={selectedRecord.values} 
                                            readOnlyMode={true}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-2xl font-bold text-red-700 mb-4">Avería del {selectedRecord.date}</h3>
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-4 rounded border">
                                            <h4 className="font-bold text-gray-700 mb-1">Agentes</h4>
                                            <p className="text-gray-900">{(selectedRecord as FaultRecord).agents}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded border">
                                            <h4 className="font-bold text-gray-700 mb-1">Descripción</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{(selectedRecord as FaultRecord).description}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded border">
                                            <h4 className="font-bold text-gray-700 mb-1">Causas</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{(selectedRecord as FaultRecord).causes}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded border">
                                            <h4 className="font-bold text-gray-700 mb-1">Reparación</h4>
                                            <p className="text-gray-900 whitespace-pre-wrap">{(selectedRecord as FaultRecord).repair}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-lg">
                                {selectedElementId ? "Seleccione un registro de la lista" : "Seleccione un elemento para ver su histórico"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
         </div>
    );
};
