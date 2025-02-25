document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const rol = document.getElementById("rol").value;

            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, email, password, rol })
            });

            const data = await response.json();
            document.getElementById("registerMessage").textContent = data.message || data.error;
            if (response.ok) setTimeout(() => window.location.href = "login.html", 1500);
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            document.getElementById("loginMessage").textContent = data.message || data.error;
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("rol", data.rol);
                setTimeout(() => window.location.href = "dashboard.html", 1500);
            }
        });
    }
});
