export async function fetchUsers() {
    const res = await fetch("http://localhost:8000/users");
        credentials: "include"  // NECESARIO para recibir las cookies
    return res.json();
}

export async function approveUser(matricula: string) {
    const res = await fetch("http://localhost:8000/users/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify({ matricula })
    });
    return res.json();
}

export async function updateUserRole(id: string, role: string) {
    const res = await fetch(`http://localhost:8000/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // NECESARIO para recibir las cookies
        body: JSON.stringify({ role })
    });
    return res.json();
}

export async function deleteUserApi(id: string) {
    await fetch(`http://localhost:8000/users/${id}`, { method: "DELETE" });
        credentials: "include"  // NECESARIO para recibir las cookies
}
