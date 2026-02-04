import { Router } from "express";

const router = Router();

// Simulação de pedidos (pode substituir por DB depois)
let pedidos = [
  { id: 1, nome: "Pedido Teste 01" },
  { id: 2, nome: "Pedido Teste 02" },
];

// LISTAR PEDIDOS
router.get("/pedidos", (_req, res) => {
  res.json(pedidos);
});

// CRIAR PEDIDO
router.post("/pedidos", (req, res) => {
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ error: "nome é obrigatório" });
  }
  const novoPedido = { id: pedidos.length + 1, nome };
  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});

export default router;
