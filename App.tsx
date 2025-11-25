
import React, { useState, useEffect, useRef } from 'react';
import { Auth } from './components/Auth';
import { SECTORS, SECTOR_KEYS, INSTALLATION_TYPES } from './constants';
import { UserRole, ElementData, InstallationType, NewElementData, MonthlyArchive, MonthlyPlan, Agent, RegistrationRequest, ApprovedUser, User } from './types';
import { generateInitialElements, generateMockAgents, initialAgentAssignments } from './services/mockData';
import { ElementRow, HistoryModal, AddElementModal } from './components/ElementDetails';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { AgentsManagement } from './components/AgentsManagement';
import { UserManagement } from './components/UserManagement';
import { fetchAgents, createAgent, deleteAgentApi } from './api/agentsApi';
import { fetchAssignments, saveAssignment } from "./api/assignmentsApi";
import { fetchElements, createElement as createElementApi, updateElement as updateElementApi, deleteElementApi} from './api/elementsApi';
// AUTH & USERS APIs
import { login as loginApi, registerRequest as registerRequestApi, logout } from "./api/authApi";
import { 
    fetchUsers, 
    approveUser as approveUserApi, 
    updateUserRole as updateUserRoleApi,
    deleteUserApi 
} from "./api/usersApi";
import { fetchRequests, deleteRequest as deleteRequestApi } from "./api/requestApi";





function App() {
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<'SECTORS' | 'STATIONS' | 'TYPES' | 'ELEMENTS'>('SECTORS');
    const [selectedSector, setSelectedSector] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<InstallationType | null>(null);
  
  // Data States
    const [elements, setElements] = useState<ElementData[]>([]);
    useEffect(() => {
        fetchElements().then(setElements);
    }, []);

    const [agents, setAgents] = useState<Agent[]>([]);
    useEffect(() => {
        fetchAgents().then(setAgents);
    }, []);

    const [agentAssignments, setAgentAssignments] = useState<Record<string, Agent[]>>({});
    useEffect(() => {
        async function tryRefresh() {
            try {
                await fetch("http://localhost:8000/auth/refresh", {
                    method: "POST",
                    credentials: "include"
                });

            // Volvemos a cargar datos de usuario desde servidor
                const u = await fetch("http://localhost:8000/auth/me", {
                    credentials: "include"
                });

                if (u.ok) setUser(await u.json());
            }
            catch { }
        }
        tryRefresh();
    }, []);

    useEffect(() => {
        async function load() {
            const backendAssignments = await fetchAssignments();
            const parsed: Record<string, Agent[]> = {};

            backendAssignments.forEach(entry => {
                parsed[entry.sector] = entry.agents
                    .map(agentId => agents.find(a => a.id === agentId))
                    .filter(Boolean) as Agent[];
            });

        setAgentAssignments(parsed);
        }

        load();
    }, [agents]);  // depende de agents porque necesitamos mapear IDs → objetos

    // Cargar usuarios aprobados al iniciar
    useEffect(() => {
        fetchUsers().then(setApprovedUsers);
    }, []);

    // Cargar solicitudes de registro al iniciar
    useEffect(() => {
        fetchRequests().then(setRegistrationRequests);
    }, []);
  

  // Auth Data
    const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  
    const [showNotifications, setShowNotifications] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);

    const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  
  // Modal States
    const [showDashboard, setShowDashboard] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [showAddElement, setShowAddElement] = useState(false);
    const [showAgentsModal, setShowAgentsModal] = useState(false);
  
  // Archives & Plans
    const [monthlyArchives, setMonthlyArchives] = useState<MonthlyArchive[]>([]);
    const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);

  // Search States
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // History Modal States
    const [historyMode, setHistoryMode] = useState<'MAINTENANCE' | 'FAULT' | null>(null);

    const elementsRef = useRef<HTMLDivElement>(null);

  // Filter helpers
    const getStations = (sector: string) => {
        if (sector === 'CÁDIZ' && !SECTORS['CÁDIZ']) {
            return SECTORS['HUELVA'] || [];
        }
        return SECTORS[sector] || [];
    };

    const getElementCount = (station: string, type: InstallationType) => {
        return elements.filter(e => e.station === station && e.type === type).length;
    };

  // Actions
    const handleLogin = async (matricula: string, password: string) => {
        try {
            const user = await loginApi(matricula, password);
            setUser(user);
            setView("SECTORS");
        } 
        catch (err) {
            alert("Credenciales incorrectas o usuario no registrado.");
        }
    };


    const handleRegisterRequest = async (req: RegistrationRequest) => {
        try {
            await registerRequestApi(req);
            alert("Solicitud enviada. Espere a que un administrador valide su cuenta.");
        } 
        catch (err) {
            alert("Ya existe un usuario o solicitud con esa matrícula.");
        }

        // Recargar solicitudes
        fetchRequests().then(setRegistrationRequests);
    };


    const handleApproveUser = async (req: RegistrationRequest) => {
        const newUser = await approveUserApi(req.matricula);

        setApprovedUsers(prev => [...prev, newUser]);

        // Eliminar solicitud del estado y del backend
        await deleteRequestApi(req.matricula);
        setRegistrationRequests(prev => prev.filter(r => r.matricula !== req.matricula));

        alert(`Usuario ${req.matricula} validado correctamente.`);
    };


    const handleRejectUser = async (matricula: string) => {
        await deleteRequestApi(matricula);
        setRegistrationRequests(prev => prev.filter(r => r.matricula !== matricula));
    };


    const handleUpdateUserRole = async (userId: string, role: UserRole) => {
        const updated = await updateUserRoleApi(userId, role);

        setApprovedUsers(prev =>
            prev.map(u => u.id === userId ? updated : u)
        );
    };


    const handleDeleteUser = async (userId: string) => {
        await deleteUserApi(userId);

        setApprovedUsers(prev => prev.filter(u => u.id !== userId));
    };


  const handleSectorClick = (sector: string) => {
    setSelectedSector(sector);
    setView('STATIONS');
  };

  const handleStationClick = (station: string) => {
    setSelectedStation(station);
    setView('TYPES');
    setGlobalSearchQuery('');
  };

  const handleTypeClick = (type: InstallationType) => {
    setSelectedType(type);
    setView('ELEMENTS');
    setLocalSearchQuery('');
  };

  const handleBack = () => {
    if (view === 'ELEMENTS') setView('TYPES');
    else if (view === 'TYPES') setView('STATIONS');
    else if (view === 'STATIONS') setView('SECTORS');
    setHistoryMode(null);
    setShowAddElement(false);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedElements);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedElements(newSet);
  };

  const forceExpandOne = (id: string) => {
      setExpandedElements(new Set([id]));
      setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  };

  const toggleMonthlyCheck = (id: string) => {
      setElements(prev => prev.map(e => {
          if (e.id === id) {
              return { ...e, isPendingMonthly: !e.isPendingMonthly };
          }
          return e;
      }));
  };

  const updateElementParams = async (id: string, newParams: Record<string, any>) => {
    const element = elements.find(e => e.id === id);
    if (!element) return;

    const updated: ElementData = {
        ...element,
        params: newParams
    };

    // GUARDAR EN LA BD
    const saved = await updateElementApi(id, updated);

    // GUARDAR EN ESTADO
    setElements(prev => prev.map(e => e.id === id ? saved : e));
  };


  const registerMaintenance = (elementId: string, date: string, agents: string, values: Record<string, any>) => {
      setElements(prev => prev.map(e => {
          if (e.id === elementId) {
              const newRecord = {
                  id: `hist-${Date.now()}`,
                  date,
                  user: agents,
                  values
              };
              return {
                  ...e,
                  lastMaintenance: date,
                  completedBy: agents,
                  maintenanceHistory: [newRecord, ...e.maintenanceHistory]
              };
          }
          return e;
      }));
      alert("Mantenimiento registrado y actualizado.");
  };

  const handleAddElement = async (data: NewElementData) => {
    const newElement: ElementData = {
        id: "", // El backend generará el id real
        name: data.name,
        type: data.type,
        station: data.station,
        sector: data.sector,
        params: data.params,
        lastMaintenance: null,
        completedBy: null,
        isPendingMonthly: true,
        maintenanceHistory: [],
        faultHistory: []
    };

    const saved = await createElementApi(newElement);

    setElements(prev => [...prev, saved]);
    alert("Elemento añadido correctamente.");

    if (selectedStation === data.station && selectedType === data.type) {
        forceExpandOne(saved.id);
    }
  };

  const handleDeleteElement = async (id: string) => {
    await deleteElementApi(id);
    setElements(prev => prev.filter(e => e.id !== id));
  };



  const handleUpdateMonthlyPlan = (month: number, year: number, elementIds: string[]) => {
      setMonthlyPlans(prev => {
          const existing = prev.findIndex(p => p.month === month && p.year === year && p.sector === selectedSector);
          if (existing >= 0) {
              const updated = [...prev];
              updated[existing].elementIds = elementIds;
              return updated;
          }
          return [...prev, { month, year, sector: selectedSector!, elementIds }];
      });
  };

  const handleValidateMonth = (month: number, year: number, snapshots: any[]) => {
      const newArchive: MonthlyArchive = {
          month,
          year,
          sector: selectedSector!,
          snapshots: snapshots
      };
      setMonthlyArchives(prev => [...prev, newArchive]);
      
      setElements(prev => prev.map(e => {
          if (e.sector === selectedSector) {
              return { ...e, isPendingMonthly: true };
          }
          return e;
      }));
      alert("Mes validado. Los elementos se han reiniciado a pendiente.");
  };

  const handleDeleteAgent = async (id: string) => {
    await deleteAgentApi(id);

    setAgents(prev => prev.filter(a => a.id !== id));

    const newAssignments = { ...agentAssignments };
    Object.keys(newAssignments).forEach(key => {
        newAssignments[key] = newAssignments[key].filter(a => a.id !== id);
    });
    setAgentAssignments(newAssignments);
};


  const getHeaderTitle = () => {
      if (view === 'SECTORS') return 'SECTORES';
      if (view === 'STATIONS') return selectedSector;
      if (view === 'TYPES') return `${selectedStation}: Instalaciones`;
      if (view === 'ELEMENTS') return `${selectedStation}: ${selectedType}`;
      return 'SIGMA-Sevilla';
  };

  const filteredGlobalElements = globalSearchQuery 
    ? elements.filter(e => e.station === selectedStation && e.name.toLowerCase().includes(globalSearchQuery.toLowerCase()))
    : [];

  const handleGlobalSearchSelect = (element: ElementData) => {
      setSelectedType(element.type);
      setView('ELEMENTS');
      forceExpandOne(element.id);
      setGlobalSearchQuery('');
      setShowGlobalSearch(false);
  };

  const handleLocalSearchSelect = (elementId: string) => {
      forceExpandOne(elementId);
      setLocalSearchQuery('');
  };
  
  const filteredLocalElements = localSearchQuery 
     ? elements.filter(e => e.station === selectedStation && e.type === selectedType && e.name.toLowerCase().includes(localSearchQuery.toLowerCase()))
     : [];

  if (!user) {
    return <Auth onLogin={handleLogin} onRegister={handleRegisterRequest} />;
  }

  const visibleElements = elements.filter(e => e.station === selectedStation && e.type === selectedType);
  const currentSectorAgents = selectedSector ? (agentAssignments[selectedSector] || []) : [];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="bg-[#006338] text-white p-3 shadow-md flex justify-between items-center shrink-0 z-50 relative">
        <div className="flex items-center gap-4 flex-1">
            {view !== 'SECTORS' && (
                <button onClick={handleBack} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
            )}
            <div className="flex flex-col">
                 <h1 className="text-xs opacity-80 tracking-widest">SIGMA-Sevilla</h1>
                 <h2 className="text-xl font-bold truncate">{getHeaderTitle()}</h2>
            </div>
        </div>

        <div className="flex gap-2 items-center">
             {view === 'ELEMENTS' && (
                <>
                     <div className="relative mr-4 group hidden md:block">
                        <div className="flex items-center bg-white/10 rounded-lg px-2 border border-white/30 focus-within:bg-white focus-within:text-gray-900 transition-colors">
                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                             <input 
                                type="text" 
                                placeholder="Buscar elemento..." 
                                className="bg-transparent border-none focus:ring-0 text-sm py-1 w-40 placeholder-gray-300 focus:placeholder-gray-500 text-inherit"
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                             />
                        </div>
                         {localSearchQuery && (
                             <div className="absolute top-full right-0 mt-1 w-64 bg-white text-gray-900 rounded shadow-xl max-h-60 overflow-y-auto z-50">
                                 {filteredLocalElements.map(e => (
                                     <button key={e.id} onClick={() => handleLocalSearchSelect(e.id)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-b">
                                         {e.name}
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>
                    <button onClick={() => setHistoryMode('FAULT')} className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow whitespace-nowrap">
                        Datos Averías
                    </button>
                    <button onClick={() => setHistoryMode('MAINTENANCE')} className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow whitespace-nowrap">
                        Datos Mantenimiento
                    </button>
                </>
            )}

            {view !== 'SECTORS' && (
                <>
                    <button onClick={() => setShowDashboard(true)} className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow ml-2">Dashboard</button>
                    <button onClick={() => setShowReports(true)} className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow">Informes</button>
                </>
            )}
            
            <button 
                onClick={() => setShowAgentsModal(true)}
                className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow ml-2 flex items-center gap-1"
            >
                <span>👥 Agentes</span>
            </button>

            {user.role === UserRole.ADMIN && view === 'SECTORS' && (
                <button 
                    onClick={() => setShowUserManagement(true)}
                    className="bg-white text-[#006338] px-3 py-1 rounded font-bold text-sm hover:bg-gray-100 shadow ml-2"
                >
                    Gestión Usuarios
                </button>
            )}

            {/* Admin Notifications */}
            {user.role === UserRole.ADMIN && (
                <button onClick={() => setShowNotifications(true)} className="relative ml-2 p-1 hover:bg-white/20 rounded">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {registrationRequests.length > 0 && (
                        <span className="absolute top-0 right-0 block h-3 w-3 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                </button>
            )}

            <div className="ml-4 flex flex-col items-end">
                <button onClick={() => setShowChangePassword(true)} className="text-xs font-mono bg-black/20 px-2 rounded hover:bg-black/40 transition-colors" title="Cambiar Contraseña">
                    {user.matricula}
                </button>
                <button 
                    onClick={async () => {
                        await logout();
                        setUser(null);
                        setView("SECTORS"); // opcional
                    }}
    className="text-xs underline hover:text-red-200 mt-1"
>
    Salir
</button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full">
        
        {/* SECTORS VIEW */}
        {view === 'SECTORS' && (
            <div className="h-full flex flex-col relative">
                {SECTOR_KEYS.map(sector => (
                    <button
                        key={sector}
                        onClick={() => handleSectorClick(sector)}
                        className="flex-1 w-full bg-white border-b border-gray-200 hover:bg-[#006338] hover:text-white transition-all flex items-center justify-center text-3xl font-bold tracking-widest uppercase group relative overflow-hidden"
                    >
                         <span className="relative z-10">{sector}</span>
                         <div className="absolute inset-0 bg-[#006338] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                    </button>
                ))}
            </div>
        )}

        {/* STATIONS VIEW */}
        {view === 'STATIONS' && selectedSector && (
            <div className="min-h-full bg-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full content-start">
                    {getStations(selectedSector).map(station => (
                        <button
                            key={station}
                            onClick={() => handleStationClick(station)}
                            className="bg-white border-l-8 border-[#006338] p-8 text-2xl font-bold shadow-lg hover:scale-[1.01] hover:bg-green-50 transition-all rounded w-full min-h-[120px] flex items-center justify-start"
                        >
                            {station}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* INSTALLATION TYPES VIEW */}
        {view === 'TYPES' && selectedStation && (
             <div className="p-6 max-w-6xl mx-auto">
                 <div className="mb-8 relative z-30">
                     <div className="relative">
                        <input 
                           type="text" 
                           className="w-full p-4 pl-12 border-2 border-gray-300 rounded-xl shadow-sm focus:border-[#006338] focus:ring-0 text-lg"
                           placeholder="Buscar elemento en la estación..."
                           value={globalSearchQuery}
                           onChange={(e) => { setGlobalSearchQuery(e.target.value); setShowGlobalSearch(true); }}
                           onFocus={() => setShowGlobalSearch(true)}
                        />
                        <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                     
                     {showGlobalSearch && globalSearchQuery && (
                         <div className="absolute w-full bg-white border border-gray-200 mt-1 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                             {filteredGlobalElements.map(e => (
                                 <button 
                                    key={e.id} 
                                    onClick={() => handleGlobalSearchSelect(e)}
                                    className="w-full text-left px-6 py-3 hover:bg-green-50 border-b last:border-0 flex justify-between items-center"
                                 >
                                     <span className="font-bold text-gray-800">{e.name}</span>
                                     <span className="text-sm text-gray-400 uppercase tracking-wider">{e.type}</span>
                                 </button>
                             ))}
                         </div>
                     )}
                 </div>

                 <div className="flex flex-col items-center gap-6">
                     {INSTALLATION_TYPES.map(type => {
                         const count = getElementCount(selectedStation, type);
                         if (user.role === UserRole.AGENT && count === 0) return null;

                         return (
                             <button
                                key={type}
                                onClick={() => handleTypeClick(type)}
                                className="w-[90%] h-40 bg-white border-l-[16px] border-[#006338] flex justify-between items-center p-8 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all rounded-r-2xl group"
                             >
                                 <span className="text-3xl font-bold group-hover:text-[#006338] transition-colors">{type}</span>
                                 <span className={`px-6 py-2 rounded-full font-bold text-lg ${count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                     {count} Elementos
                                 </span>
                             </button>
                         )
                     })}
                 </div>
                 
                 {user.role !== UserRole.AGENT && (
                     <div className="w-[90%] mx-auto mt-8">
                        <button 
                            onClick={() => setShowAddElement(true)}
                            className="w-full border-2 border-dashed border-gray-300 text-gray-400 p-6 rounded-xl hover:border-[#006338] hover:text-[#006338] transition-colors font-bold text-lg"
                        >
                            + Añadir Nueva Instalación (Admin/Sup)
                        </button>
                     </div>
                 )}
             </div>
        )}

        {/* ELEMENTS LIST VIEW */}
        {view === 'ELEMENTS' && selectedStation && selectedType && (
            <div className="p-4" ref={elementsRef}>
                <div className="flex justify-between items-center mb-6">
                    {(user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) && (
                        <button 
                            onClick={() => setShowAddElement(true)}
                            className="bg-[#006338] text-white px-6 py-2 rounded-lg hover:bg-[#004f2d] shadow-md font-bold w-full md:w-auto ml-auto"
                        >
                            + Añadir Elemento
                        </button>
                    )}
                </div>
                
                <div className="space-y-6 pb-20">
                    {visibleElements.map(element => (
                            <div id={element.id} key={element.id} className="scroll-mt-24">
                                <ElementRow 
                                    element={element}
                                    role={user.role}
                                    isExpanded={expandedElements.has(element.id)}
                                    assignedAgents={currentSectorAgents}
                                    onToggleExpand={() => toggleExpand(element.id)}
                                    onToggleCheck={() => toggleMonthlyCheck(element.id)}
                                    onUpdateParams={(params) => updateElementParams(element.id, params)}
                                    onRegisterMaintenance={(d, a, v) => registerMaintenance(element.id, d, a, v)}
                                />
                            </div>
                        ))
                    }
                    {visibleElements.length === 0 && (
                         <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-xl font-medium">No hay elementos registrados.</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>

      {/* Modals */}
      {showDashboard && (
          <Dashboard 
            elements={elements} 
            archives={monthlyArchives}
            plans={monthlyPlans}
            sector={selectedSector || 'SEVILLA-SANTA JUSTA'}
            onClose={() => setShowDashboard(false)} 
            onValidateMonth={handleValidateMonth}
            onUpdateMonthlyPlan={handleUpdateMonthlyPlan}
          />
      )}

      {showReports && (
          <Reports onClose={() => setShowReports(false)} />
      )}

      {historyMode && selectedStation && selectedType && (
          <HistoryModal 
            mode={historyMode} 
            elements={visibleElements} 
            onClose={() => setHistoryMode(null)} 
          />
      )}

      {showAddElement && (
          <AddElementModal 
            sector={selectedSector || 'SEVILLA-SANTA JUSTA'} 
            stations={selectedStation ? [selectedStation] : (selectedSector ? getStations(selectedSector) : [])}
            onClose={() => setShowAddElement(false)}
            onSubmit={handleAddElement}
          />
      )}

      {showAgentsModal && (
          <AgentsManagement 
            allAgents={agents}
            assignments={agentAssignments}
            onUpdateAssignments={async (newAssignments) => {
                setAgentAssignments(newAssignments);

                // Guardar cada sector individualmente
                for (const sector of Object.keys(newAssignments)) {
                    const agentsIds = newAssignments[sector].map(a => a.id);
                    await saveAssignment(sector, agentsIds);
                }
            }}

            onAddAgent={async (a) => {
                const saved = await createAgent(a);
                setAgents(prev => [...prev, saved]);
            }}
            onDeleteAgent={handleDeleteAgent}
            onClose={() => setShowAgentsModal(false)}
          />
      )}

      {showUserManagement && user.role === UserRole.ADMIN && (
          <UserManagement 
            users={approvedUsers} 
            onUpdateRole={handleUpdateUserRole}
            onDeleteUser={handleDeleteUser}
            onClose={() => setShowUserManagement(false)}
          />
      )}

      {/* Notification Modal (Admin) */}
      {showNotifications && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
              <div className="bg-white rounded-xl w-[500px] shadow-2xl overflow-hidden">
                  <div className="bg-[#006338] p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold text-lg">Solicitudes de Registro</h3>
                      <button onClick={() => setShowNotifications(false)}>✕</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                      {registrationRequests.length === 0 ? (
                          <p className="text-gray-500 text-center italic py-4">No hay solicitudes pendientes.</p>
                      ) : (
                          registrationRequests.map(req => (
                              <div key={req.matricula} className="border-b p-4 flex justify-between items-center last:border-0">
                                  <div>
                                      <div className="font-bold text-gray-800">{req.name} {req.surname1}</div>
                                      <div className="text-sm text-gray-500">Matrícula: {req.matricula}</div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleApproveUser(req)} className="bg-green-100 text-green-700 px-3 py-1 rounded font-bold text-xs hover:bg-green-200 transition-colors">Aceptar</button>
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Just prevent bubbling
                                            if(confirm("¿Rechazar y eliminar solicitud?")) {
                                                handleRejectUser(req.matricula);
                                            }
                                        }} 
                                        className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-xs hover:bg-red-200 transition-colors cursor-pointer"
                                      >
                                        Rechazar
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
              <div className="bg-white rounded-xl w-[400px] p-6 shadow-2xl">
                  <h3 className="font-bold text-xl text-[#006338] mb-4 border-b pb-2">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700">Nueva Contraseña</label>
                          <input type="password" className="w-full border p-2 rounded" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700">Confirmar Contraseña</label>
                          <input type="password" className="w-full border p-2 rounded" />
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                      <button onClick={() => setShowChangePassword(false)} className="text-gray-600 font-bold">Cancelar</button>
                      <button onClick={() => { alert("Contraseña actualizada"); setShowChangePassword(false); }} className="bg-[#006338] text-white px-4 py-2 rounded font-bold">Guardar</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

export default App;
