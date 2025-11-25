import { ElementData } from "../types";
import { API_URL } from './config';

export async function fetchElements(): Promise<ElementData[]> {
    const res = await fetch(`${API_URL}/elements`);
        credentials: "include"  // NECESARIO para recibir las cookies
    return res.json();
}

export async function createElement(element: ElementData): Promise<ElementData> {
    const res = await fetch(`${API_URL}/elements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify(element)
    });
    return res.json();
}

export async function updateElement(id: string, data: ElementData): Promise<ElementData> {
    const res = await fetch(`${API_URL}/elements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function deleteElementApi(id: string): Promise<void> {
    await fetch(`${API_URL}/elements/${id}`, {
        method: "DELETE",
        credentials: "include"  // NECESARIO para recibir las cookies
    });
}
