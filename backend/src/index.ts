import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const {
  APP_PORT = "3000",
  JWT_SECRET = "supersecretjwt",
  POSTGRES_HOST = "db",
  POSTGRES_PORT = "5432",
  POSTGRES_USER = "postgres",
  POSTGRES_PASSWORD = "postgres",
  POSTGRES_DB = "appdb",
} = process.env;

const pool = new Pool({
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});

// cria tabela automaticamente (simples e direto)
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("✅ Banco pronto (tabela users ok)");
}

function signToken(userId: number, email: string) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "1h" });
}

// Healthcheck simples
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API rodando ✅" });
});

// Registro
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "email e password são obrigatórios" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "password muito curta (mínimo 4)" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user.id, user.email);

    return res.status(201).json({
      message: "Usuário registrado ✅",
      user,
      token,
    });
  } catch (err: any) {
    // email duplicado
    if (err?.code === "23505") {
      return res.status(409).json({ error: "Email já registrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "email e password são obrigatórios" });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = signToken(user.id, user.email);

    return res.json({
      message: "Login OK ✅",
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// Start
initDb()
  .then(() => {
    app.listen(Number(APP_PORT), "0.0.0.0", () => {
      console.log(`🚀 API rodando em http://localhost:${APP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar DB", err);
    process.exit(1);
  });
