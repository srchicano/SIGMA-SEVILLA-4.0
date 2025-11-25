
import React, { useState, useMemo } from 'react';
import { Agent } from '../types';
import { SECTOR_KEYS } from '../constants';

interface Props {
    allAgents: Agent[];
    assignments: Record<string, Agent[]>;
    onUpdateAssignments: (assignments: Record<string, Agent[]>) => void;
    onAddAgent: (agent: Agent) => void;
    onDeleteAgent: (agentId: string) => void;
    onClose: () => void;
}

export const AgentsManagement: React.FC<Props> = ({ allAgents, assignments, onUpdateAssignments, onAddAgent, onDeleteAgent, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');

    // Calculate unassigned agents: Agents that are NOT in any sector list
    const unassignedAgents = useMemo(() => {
        // Explicitly cast the result of flat() to Agent[] to avoid 'unknown' type error
        const flatAssignments = Object.values(assignments).flat() as Agent[];
        const assignedIds = new Set(flatAssignments.map(a => a.id));
        return allAgents.filter(a => !assignedIds.has(a.id));
    }, [allAgents, assignments]);

    const handleDragStart = (e: React.DragEvent, agent: Agent) => {
        e.dataTransfer.setData('agentId', agent.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, targetSector: string | 'UNASSIGNED') => {
        e.preventDefault();
        const agentId = e.dataTransfer.getData('agentId');
        const agent = allAgents.find(a => a.id === agentId);
        
        if (!agent) return;

        // Logic: 
        // 1. Remove agent from wherever they are (Previous Sector)
        // 2. If target is a Sector, add them there.
        // 3. If target is UNASSIGNED, we just stop (step 1 effectively unassigned them)

        const newAssignments = { ...assignments };
        
        // 1. Remove from any existing sector
        Object.keys(newAssignments).forEach(sectorKey => {
            newAssignments[sectorKey] = newAssignments[sectorKey].filter(a => a.id !== agentId);
        });

        // 2. Add to target sector if applicable
        if (targetSector !== 'UNASSIGNED') {
            if (!newAssignments[targetSector]) newAssignments[targetSector] = [];
            newAssignments[targetSector].push(agent);
        }

        onUpdateAssignments(newAssignments);
    };

    const handleAddNewAgent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAgentName.trim()) return;
        
        const agent: Agent = {
            id: `agent-${Date.now()}`,
            name: newAgentName.toUpperCase().trim()
        };
        onAddAgent(agent);
        setNewAgentName('');
        setShowAddForm(false);
    };

    const AgentCard: React.FC<{ agent: Agent, isUnassigned?: boolean }> = ({ agent, isUnassigned }) => (
        <div 
            draggable
            onDragStart={(e) => handleDragStart(e, agent)}
            className="relative bg-white border border-gray-300 rounded-lg shadow-sm mb-2 cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center h-16 w-full hover:shadow-md transition-all group px-2 select-none"
        >
            {isUnassigned && (
                <button 
                    type="button"
                    // Only stopPropagation on mouseDown to prevent drag start.
                    // Do NOT call preventDefault() as it can interfere with click event generation.
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        if(confirm(`¿Eliminar definitivamente a ${agent.name}?`)) {
                            onDeleteAgent(agent.id);
                        }
                    }} 
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-600 hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-full transition-colors z-50 pointer-events-auto"
                    title="Eliminar trabajador del sistema"
                >
                    ✕
                </button>
            )}
            <div className="text-center w-full px-2">
                <span className="font-bold text-gray-800 text-xs md:text-sm block leading-tight truncate uppercase">
                    {agent.name}
                </span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white w-[98%] h-[95%] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#006338] p-4 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">Gestión de Agentes por Sector</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">✕</button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Unassigned Agents */}
                    <div 
                        className="w-1/5 bg-gray-100 border-r border-gray-300 flex flex-col p-4"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'UNASSIGNED')}
                    >
                        <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                            <span>Sin Asignar ({unassignedAgents.length})</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-500">Arrastra aquí</span>
                        </h3>

                        <button 
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="mb-4 bg-[#006338] text-white py-2 rounded font-bold hover:bg-[#004f2d] transition-colors shadow"
                        >
                            {showAddForm ? 'Cancelar' : '+ Nuevo Agente'}
                        </button>

                        {showAddForm && (
                            <form onSubmit={handleAddNewAgent} className="mb-4 bg-white p-3 rounded border shadow-sm space-y-2">
                                <input 
                                    placeholder="NOMBRE COMPLETO" 
                                    required 
                                    value={newAgentName} 
                                    onChange={e => setNewAgentName(e.target.value.toUpperCase())} 
                                    className="w-full border p-1 rounded text-sm font-bold uppercase" 
                                />
                                <button type="submit" className="w-full bg-blue-600 text-white text-xs font-bold py-1 rounded">Guardar</button>
                            </form>
                        )}

                        <div className="mb-4">
                            <input 
                                type="text" 
                                placeholder="Buscar agente..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border p-2 rounded bg-white shadow-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 border-t pt-2">
                            {unassignedAgents
                                .filter(a => 
                                    a.name.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(agent => (
                                    <AgentCard key={agent.id} agent={agent} isUnassigned={true} />
                                ))
                            }
                            {unassignedAgents.length === 0 && (
                                <div className="text-center text-gray-400 text-sm italic p-4">
                                    No hay agentes sin asignar.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Area: Sectors Columns */}
                    <div className="flex-1 overflow-x-auto p-4 bg-gray-200">
                        <div className="flex gap-4 h-full min-w-max">
                            {SECTOR_KEYS.map(sector => (
                                <div 
                                    key={sector}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, sector)}
                                    className="w-64 bg-gray-50 rounded-xl flex flex-col border border-gray-300 shadow-md"
                                >
                                    <div className="p-3 bg-white rounded-t-xl text-center font-bold text-[#006338] border-b border-gray-200 uppercase tracking-wide">
                                        {sector}
                                    </div>
                                    <div className="flex-1 p-2 overflow-y-auto space-y-2 bg-gray-100/50">
                                        {(assignments[sector] || []).map(agent => (
                                            <AgentCard 
                                                key={agent.id} 
                                                agent={agent}
                                            />
                                        ))}
                                        {(assignments[sector] || []).length === 0 && (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-300 rounded m-2">
                                                Arrastra agentes aquí
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 bg-gray-200 rounded-b-xl text-center text-xs text-gray-600 font-bold border-t border-gray-300">
                                        {(assignments[sector] || []).length} Asignados
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};