import { API_URL } from './config';

export async function fetchAssignments() {
    const res = await fetch(`${API_URL}/assignments`);
        credentials: "include"  // NECESARIO para recibir las cookies
    return await res.json();
}

export async function saveAssignment(sector: string, agents: string[]) {
    await fetch(`${API_URL}/assignments/${sector}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify({ agents })
    });
}
