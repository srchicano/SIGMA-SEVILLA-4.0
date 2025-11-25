export async function login(matricula: string, password: string) {
    const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, password }),
        credentials: "include"  // NECESARIO para recibir las cookies
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");
    return res.json();
}

export async function logout() {
    await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include"
    });
}

export async function registerRequest(data: any) {
    const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"  // NECESARIO para recibir las cookies
    });
    return res.json();
}
