document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    const usernameElement = document.getElementById("username");
    const dashboardContent = document.getElementById("dashboard-content");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Obtener datos del usuario
    const response = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const userData = await response.json();
    usernameElement.textContent = userData.nombre;

    // Contenido según el rol
    if (userData.rol == "admin") {
        dashboardContent.innerHTML = `
            <h3>Opciones de Maestro</h3>
            <ul>
                <li><a href="tareas.html">Administrar Tareas</a></li>
                <li><a href="respuestas.html">Revisar Respuestas</a></li>
            </ul>
        `;
    } else {
        dashboardContent.innerHTML = `
            <h3>Opciones de Alumno</h3>
            <ul>
                <li><a href="tareas.html">Ver Tareas</a></li>
                <li><a href="respuestas.html">Mis Respuestas</a></li>
            </ul>
        `;
    }

    // Logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        window.location.href = "login.html";
    });
});
