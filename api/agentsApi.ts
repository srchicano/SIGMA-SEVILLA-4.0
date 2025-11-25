import { Agent } from '../types';
import { API_URL } from './config';

export async function fetchAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_URL}/agents`);
        credentials: "include"  // NECESARIO para recibir las cookies
    return await res.json();
}

export async function createAgent(agent: Agent): Promise<Agent> {
    const res = await fetch(`${API_URL}/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify(agent)
    });
    return await res.json();
}

export async function deleteAgentApi(id: string): Promise<void> {
    await fetch(`${API_URL}/agents/${id}`, {
        method: "DELETE",
        credentials: "include"  // NECESARIO para recibir las cookies
    });
}
