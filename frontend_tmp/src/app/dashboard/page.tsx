"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full p-6 border rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Dashboard ✅</h1>
        <p className="text-sm text-gray-600 mb-4">
          Você está autenticado porque existe um token no localStorage.
        </p>

        <div className="text-xs bg-gray-50 border rounded-xl p-3 overflow-auto">
          <p className="font-semibold mb-1">Token (preview)</p>
          <pre className="whitespace-pre-wrap break-all">{token}</pre>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full py-2 rounded-xl border hover:bg-gray-50"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
