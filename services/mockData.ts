
import { ElementData, InstallationType, Agent } from '../types';
import { SECTORS } from '../constants';

export const generateInitialElements = (): ElementData[] => {
  const elements: ElementData[] = [];
  let idCounter = 1;

  // Helper to add elements
  const add = (sector: string, station: string, type: InstallationType, name: string) => {
    elements.push({
      id: `el-${idCounter++}`,
      sector,
      station,
      type,
      name,
      lastMaintenance: Math.random() > 0.7 ? new Date().toISOString().split('T')[0] : null,
      completedBy: Math.random() > 0.7 ? 'GARCIA LOPEZ, JUAN' : null,
      isPendingMonthly: Math.random() > 0.5,
      params: {},
      maintenanceHistory: [
        {
            id: `hist-m-${Math.random()}`,
            date: '2023-10-01',
            user: 'GARCIA LOPEZ, JUAN',
            values: { 'frecuencia': '100Hz', 'tension': '220V' } // Mock values
        },
        {
            id: `hist-m-${Math.random()}`,
            date: '2023-09-01',
            user: 'PEREZ RUIZ, ANA',
            values: { 'frecuencia': '99Hz', 'tension': '219V' }
        }
      ],
      faultHistory: [
        {
            id: `hist-f-${Math.random()}`,
            date: '2023-08-15',
            agents: 'GARCIA LOPEZ, JUAN',
            description: 'Fallo en alimentación',
            causes: 'Fusible fundido por sobretensión',
            repair: 'Sustitución de fusible y comprobación de carga'
        }
      ]
    });
  };

  // Seed some data
  Object.keys(SECTORS).forEach(sector => {
    SECTORS[sector].forEach(station => {
      // Add some random elements for each type
      add(sector, station, InstallationType.CIRCUITOS, "C.V. 1-2");
      add(sector, station, InstallationType.CIRCUITOS, "C.V. 3-4");
      add(sector, station, InstallationType.MOTORES, "Aguja 1A");
      if (Math.random() > 0.3) add(sector, station, InstallationType.PN, "PN km 200");
      add(sector, station, InstallationType.SENALES, "S1/2");
      add(sector, station, InstallationType.BATERIAS, "Bat. Principal");
      add(sector, station, InstallationType.ENCLAVAMIENTO, "ENC. ELECTRONICO");
    });
  });

  return elements;
};

export const generateMockAgents = (): Agent[] => {
    return [
        { id: 'a1', name: 'GARCIA LOPEZ, JUAN' },
        { id: 'a2', name: 'PEREZ RUIZ, ANA' },
        { id: 'a3', name: 'RODRIGUEZ SANCHEZ, MANUEL' },
        { id: 'a4', name: 'GONZALEZ MARTIN, MARIA' },
        { id: 'a5', name: 'FERNANDEZ JIMENEZ, ANTONIO' },
        { id: 'a6', name: 'LOPEZ GOMEZ, JOSE' },
        { id: 'a7', name: 'MARTINEZ DIAZ, LAURA' },
        { id: 'a8', name: 'SANCHEZ PEREZ, DAVID' },
    ];
};

export const initialAgentAssignments = (agents: Agent[]): Record<string, Agent[]> => {
    const assignments: Record<string, Agent[]> = {};
    const sectors = Object.keys(SECTORS);
    
    // Randomly assign agents to sectors for demo
    agents.forEach((agent, index) => {
        const sector = sectors[index % sectors.length];
        if (!assignments[sector]) assignments[sector] = [];
        assignments[sector].push(agent);
    });
    
    return assignments;
};