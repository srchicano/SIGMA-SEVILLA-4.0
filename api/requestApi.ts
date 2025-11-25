export async function fetchRequests() {
    const res = await fetch("http://localhost:8000/requests");
        credentials: "include"  // NECESARIO para recibir las cookies
    return res.json();
}

export async function deleteRequest(matricula: string) {
    await fetch(`http://localhost:8000/requests/${matricula}`, {
        method: "DELETE",
        credentials: "include"  // NECESARIO para recibir las cookies
    });
}
