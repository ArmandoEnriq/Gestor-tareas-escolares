document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");
    const taskList = document.getElementById("task-list");
    const adminSection = document.getElementById("admin-section");

    if (!token) {
        window.location.href = "login.html";
        return;
    }
       // Obtener datos del usuario
       const respu = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const userData = await respu.json();

    // Mostrar el formulario solo si el usuario es maestro
    if (userData.rol == "admin") {
        adminSection.style.display = "block";
        document.getElementById("taskForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const titulo = document.getElementById("titulo").value;
            const descripcion = document.getElementById("descripcion").value;
            const fecha_limite = document.getElementById("fecha_limite").value;
        
            const response = await fetch("http://localhost:5000/api/tareas", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ titulo, descripcion, fecha_limite })
            });
        
            if (response.ok) {
                alert("Tarea creada exitosamente.");
                location.reload();
            }
        });
    }

    // Obtener y mostrar las tareas
    const response = await fetch("http://localhost:5000/api/tareas", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const tasks = await response.json();
    taskList.innerHTML = tasks.map(task => `
        <div class="task">
            <h3>${task.titulo}</h3>
            <p>${task.descripcion}</p>
            ${userData.rol !== "admin" ? `
                <input type="file" id="file-${task.id}">
                <button onclick="submitResponse(${task.id})">Subir Respuesta</button>
            ` : ""}
        </div>
    `).join("");

    // Logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        window.location.href = "login.html";
    });
});

// Función para que los alumnos suban su respuesta
async function submitResponse(taskId) {
    const token = localStorage.getItem("token");
    const fileInput = document.getElementById(`file-${taskId}`);
    
    if (!fileInput.files.length) {
        alert("Selecciona un archivo.");
        return;
    }

    const formData = new FormData();
    formData.append("archivo", fileInput.files[0]);
    formData.append("taskId", taskId);

    const response = await fetch(`http://localhost:5000/api/respuestas/${taskId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    });

    if (response.ok) {
        alert("Respuesta subida correctamente.");
    } else {
        alert("Error al subir la respuesta.");
    }
}
