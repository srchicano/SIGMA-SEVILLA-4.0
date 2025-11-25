
export enum UserRole {
  AGENT = 'AGENTE',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMINISTRADOR'
}

export interface User {
  matricula: string;
  password?: string;
  role: UserRole;
  name?: string;
  surname1?: string;
  surname2?: string;
}

export interface ApprovedUser extends User {
    id: string;
}

export enum InstallationType {
  CIRCUITOS = "CIRCUITOS DE VÍA",
  MOTORES = "MOTORES",
  PN = "PN",
  SENALES = "SEÑALES Y ASFA",
  BATERIAS = "BATERÍAS",
  ENCLAVAMIENTO = "ENCLAVAMIENTO"
}

export interface Agent {
    id: string;
    name: string; // Full name, uppercase
}

export interface FaultRecord {
  id: string;
  date: string;
  agents: string;
  description: string;
  causes: string;
  repair: string;
}

export interface MaintenanceHistoryRecord {
  id: string;
  date: string;
  user: string;
  values: Record<string, any>; // Snapshot of values
}

export interface ElementData {
  id: string;
  name: string;
  type: InstallationType;
  sector: string;
  station: string;
  lastMaintenance: string | null;
  completedBy: string | null;
  isPendingMonthly: boolean; // True = Checkbox unchecked (Pending), False = Checkbox checked (Completed)
  // Reference params (technical specs)
  params: Record<string, any>;
  maintenanceHistory: MaintenanceHistoryRecord[];
  faultHistory: FaultRecord[];
}

export interface MonthlyArchive {
    month: number;
    year: number;
    sector: string;
    snapshots: {
        elementId: string;
        status: 'COMPLETED' | 'PENDING';
    }[];
}

// A plan defines which elements are on the list for a specific month/year/sector
export interface MonthlyPlan {
    month: number;
    year: number;
    sector: string;
    elementIds: string[];
}

export interface NewElementData {
    name: string;
    type: InstallationType;
    station: string;
    sector: string;
    params: Record<string, any>;
}

export interface MaintenanceRecord {
  id: string;
  elementId: string;
  date: string;
  user: string;
  shift: string; // 'Mañana', 'Tarde', 'Noche'
  values: Record<string, any>;
  type: 'MAINTENANCE' | 'FAULT';
  description?: string; // For faults
  resolution?: string; // For faults
}

export interface RegistrationRequest {
    matricula: string;
    password: string;
    name: string;
    surname1: string;
    surname2: string;
}