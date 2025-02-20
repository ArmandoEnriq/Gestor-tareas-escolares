const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

// REGISTRO DE USUARIO
router.post("/register", async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  // Verificar si el usuario ya existe
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la BD
    db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword,rol],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Error al registrar usuario" });
        res.json({ message: "Usuario registrado correctamente" });
      }
    );
  });
});

// LOGIN DE USUARIO
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login exitoso", token });
  });
});

module.exports = router;
