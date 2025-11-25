import { InstallationType } from './types';

export const SECTORS: Record<string, string[]> = {
  "SEVILLA-SANTA JUSTA": [
    "DOS HERMANAS", "LA SALUD", "SEVILLA SANTA JUSTA", "LA NEGRILLA", 
    "TRIÁNGULO TAMARGUILLO", "MAJARABIQUE", "CARTUJA", "ALAMILLO", 
    "VALENCINA-SANTIPONCE", "SALTERAS", "VVA ARISCAL Y OLIVARES", "BENACAZÓN"
  ],
  "SEVILLA-SAN PABLO": [
    "CTT", "BRENES", "LOS ROSALES", "LORA DEL RIO", "VVA DEL RIO Y MINAS", 
    "PEDROSO", "CAZALLA-CONSTANTINA", "GUADALCANAL"
  ],
  "HUELVA": [ // Note: Prompt said "HUELVA" in the list description even if not in top 5 initially listed? Assuming standard list based on prompt content.
    "HUELVA MERCANCÍAS", "GIBRALEÓN", "CALAÑAS", "VALDELAMUSA", 
    "JABUGO-GALAROZA", "S. JUAN DEEL PUERTO", "NIEBLA", "LA PALMA DEL CONDADO", 
    "ESCACENA", "CARRIÓN DE LOS CÉSPEDES", "AZNALCAZAR-PILAS"
  ],
  "UTRERA": [
    "UTRERA", "BIF. UTRERA", "EL SORBITO", "ARAHAL", "MARCHENA", "OSUNA", 
    "PEDRERA", "FUENTE DE PIEDRA", "LAS CABEZAS DE S. JUAN", "LEBRIJA"
  ],
  "JEREZ": [
    "AEROPUERTO DE JEREZ", "JEREZ MERCANCÍAS", "JEREZ DE LA FRONTERA", 
    "PUERTO DE STA MARÍA", "LAS ALETAS", "UNIVERSIDAD DE CÁDIZ", 
    "SAN FERNANDO-BAHÍA SUR", "RÍO ARILLO", "CORTADURA", "CÁDIZ"
  ]
};

// Just for safety in case Huelva was meant to be one of the 5, but the prompt listed: 
// "SEVILLA-SANTA JUSTA", "SEVILLA-SAN PABLO", "UTRERA", "JEREZ" y "CÁDIZ".
// However, later it details "HUELVA = {...}". 
// I will treat CÁDIZ as a Sector that might contain stations or if the user meant Huelva is the 5th.
// Given the detailed list, I'll include HUELVA in the map but only show the top 5 buttons as requested if feasible.
// Actually, looking closely at the prompt: "los 5 sectores serán... CÁDIZ".
// But the detailed breakdown lists "HUELVA". I will interpret that HUELVA might be the 5th or CÁDIZ is the sector name containing Jerez stations? 
// Re-reading: "JEREZ = {... CÁDIZ}". So Cádiz is a station in Jerez sector. 
// I will assume the 5 sectors are: SEVILLA-SJ, SEVILLA-SP, UTRERA, JEREZ, and HUELVA (since Cádiz is a station in Jerez). 
// Wait, the prompt says: "los 5 sectores serán 'SEVILLA-SANTA JUSTA', 'SEVILLA-SAN PABLO', 'UTRERA', 'JEREZ' y 'CÁDIZ'".
// But then details content for HUELVA. I will display the 5 BUTTONS requested: SEVILLA-SJ, SEVILLA-SP, UTRERA, JEREZ, CÁDIZ.
// And I will map the "CÁDIZ" button to the "HUELVA" data if that's the implication, OR I will leave Cádiz empty and Huelva accessible if I add it. 
// To be safe and functional: I will add HUELVA as a button and CÁDIZ as a button (total 6?) or just follow the 5 list. 
// Let's use the 5 explicit sector names for buttons, but maybe map CÁDIZ button to HUELVA stations if it was a typo, or empty.
// Actually, standard interpretation: The prompt detailed HUELVA content. I'll add HUELVA as a valid sector key.

export const SECTOR_KEYS = [
  "SEVILLA-SANTA JUSTA", 
  "SEVILLA-SAN PABLO", 
  "UTRERA", 
  "JEREZ", 
  "CÁDIZ" // Prompt requested this specific name
];

// Map the display name "CÁDIZ" to the content of "HUELVA" if strictly following the content provision, 
// OR just provide an empty list for Cádiz if not provided.
// Given the ambiguity, I will include HUELVA in the data object and if the user clicks CÁDIZ, I'll show HUELVA stations if likely, 
// or just show empty. I'll add HUELVA to the SECTORS object.
// I will add a logic: If Sector is "CÁDIZ" and no stations defined, maybe they meant HUELVA?
// Let's stick to the data provided. 

export const INSTALLATION_TYPES = [
  InstallationType.CIRCUITOS,
  InstallationType.MOTORES,
  InstallationType.PN,
  InstallationType.SENALES,
  InstallationType.BATERIAS,
  InstallationType.ENCLAVAMIENTO
];
