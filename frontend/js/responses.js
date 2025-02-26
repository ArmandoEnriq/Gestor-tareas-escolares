const token = localStorage.getItem("token");
const rol =localStorage.getItem("rol")
const respuestaList = document.getElementById("respuesta-list");
const tituloVista = document.getElementById("titulo-vista");

document.addEventListener("DOMContentLoaded", async () => {
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

    if (userData.rol == "admin") {
        tituloVista.innerText = "Respuestas de los Estudiantes";
        cargarRespuestasMaestro();
    } else {
        tituloVista.innerText = "Tus Calificaciones";
        cargarCalificacionesAlumno();
    }

    // Logout
    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        window.location.href = "login.html";
    });
});

// Función para que los maestros vean respuestas y puedan calificarlas
async function cargarRespuestasMaestro() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/tareas", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const tareas = await response.json();

    respuestaList.innerHTML = tareas.map(tarea => `
        <div class="tarea">
            <h3>${tarea.titulo}</h3>
            <p>${tarea.descripcion}</p>
            <button onclick="verRespuestas(${tarea.id})">Ver Respuestas</button>
            <div id="respuestas-${tarea.id}" class="respuestas"></div>
        </div>
    `).join("");
}

// Cargar respuestas de una tarea específica
async function verRespuestas(tareaId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5000/api/respuestas/${tareaId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const respuestas = await response.json();
    const respuestasDiv = document.getElementById(`respuestas-${tareaId}`);

    respuestasDiv.innerHTML = respuestas.map(respuesta => `
        <div class="respuesta">
            <p><strong>Alumno:</strong> ${respuesta.alumno}</p>
            <p><strong>Fecha de envío:</strong> ${respuesta.fecha_envio}</p>
            <a href="http://localhost:5000/uploads/${respuesta.archivo}" target="_blank">Ver Archivo</a>
            ${respuesta.calificacion ? `
                <p><strong>Calificación:</strong> ${respuesta.calificacion}</p>
                <p><strong>Comentario:</strong> ${respuesta.comentario}</p>
            ` : `
                <input type="number" id="calificacion-${respuesta.id}" placeholder="Calificación">
                <input type="text" id="comentario-${respuesta.id}" placeholder="Comentario">
                <button onclick="calificarRespuesta(${respuesta.id})">Calificar</button>
            `}
        </div>
    `).join("");
}

// Función para calificar una respuesta
async function calificarRespuesta(respuestaId) {
    const token = localStorage.getItem("token");
    const calificacion = document.getElementById(`calificacion-${respuestaId}`).value;
    const comentario = document.getElementById(`comentario-${respuestaId}`).value;

    if (!calificacion) {
        alert("Debes ingresar una calificación.");
        return;
    }

    const response = await fetch(`http://localhost:5000/api/respuestas/calificar/${respuestaId}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ calificacion, comentario })
    });

    if (response.ok) {
        alert("Respuesta calificada correctamente.");
        location.reload();
    } else {
        alert("Error al calificar.");
    }
}

// Función para que los alumnos vean sus calificaciones y comentarios
async function cargarCalificacionesAlumno() {
    const token = localStorage.getItem("token");

    // Petición para obtener las respuestas del alumno
    const response = await fetch("http://localhost:5000/api/respuestas/mis-respuestas", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const respuestas = await response.json();

    if (!respuestas.length) {
        respuestaList.innerHTML = "<p>No tienes calificaciones aún.</p>";
        return;
    }

    respuestaList.innerHTML = respuestas.map(respuesta => `
        <div class="respuesta">
            <h3>${respuesta.titulo}</h3>
            <p><strong>Fecha de entrega:</strong> ${respuesta.fecha_envio}</p>
            <a href="http://localhost:5000/uploads/${respuesta.archivo}" target="_blank">Ver Archivo Entregado</a>
            ${respuesta.calificacion ? `
                <p><strong>Calificación:</strong> ${respuesta.calificacion}</p>
                <p><strong>Comentario del maestro:</strong> ${respuesta.comentario}</p>
            ` : `
                <p>Aún no ha sido calificado.</p>
            `}
        </div>
    `).join("");
}
