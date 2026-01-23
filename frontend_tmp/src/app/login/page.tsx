"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("gui@email.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Erro no login");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch {
      setError("Falha ao conectar no backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 border rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="w-full mt-1 p-2 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="1234"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full py-2 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Não tem conta?{" "}
          <a className="underline" href="/register">
            Registrar
          </a>
        </p>
      </div>
    </main>
  );
}
