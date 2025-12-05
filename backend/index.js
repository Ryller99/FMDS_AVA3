import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import swagger from "./swagger.js";





dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// Configuração Supabase
// ------------------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------
// Rotas auxiliares: categories e statuses
// ------------------------------------------------------

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retorna a lista todos as categorias
 *     tags:
 *       - Categorias
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso.
 */
app.get("/categories", async (req, res) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return res.status(500).json({ error: "Erro ao buscar categorias" });
  }

  res.json(data);
});

/**
 * @swagger
 * /statuses:
 *   get:
 *     summary: Retorna a lista todos os status
 *     tags:
 *       - Status
 *     responses:
 *       200:
 *         description: Lista de status retornada com sucesso.
 */

app.get("/statuses", async (req, res) => {
  const { data, error } = await supabase
    .from("statuses")
    .select("id, name, description")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar status:", error);
    return res.status(500).json({ error: "Erro ao buscar status" });
  }

  res.json(data);
});

// ------------------------------------------------------
// CRUD LOANS (empréstimos)
// ------------------------------------------------------
/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Retorna a lista todos os loans (empréstimos)  
 *     tags:
 *       - Empréstimos
 *     responses:
 *       200:
 *         description: Lista de loans (empréstimos) retornada com sucesso.
 */
// GET /loans -> lista todos os empréstimos
app.get("/loans", async (req, res) => {
  const { data, error } = await supabase
    .from("loans")
    .select(`
      id,
      friend_name,
      description,
      amount,
      due_date,
      created_at,
      category_id,
      status_id
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return res.status(500).json({ error: "Erro ao buscar empréstimos" });
  }

  res.json(data);
});

// GET /loans/:id -> busca um empréstimo específico

/**
 * @swagger
 * /loans/{id}:
 *   get:
 *     summary: Retorna um empréstimo específico pelo ID
 *     tags:
 *       - Empréstimos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do empréstimo
 *     responses:
 *       200:
 *         description: Empréstimo encontrado com sucesso.
 *       404:
 *         description: Empréstimo não encontrado.
 *       500:
 *         description: Erro interno ao buscar empréstimo.
 */

app.get("/loans/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("loans")
    .select(`
      id,
      friend_name,
      description,
      amount,
      due_date,
      created_at,
      category_id,
      status_id
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar empréstimo:", error);
    return res.status(404).json({ error: "Empréstimo não encontrado" });
  }

  res.json(data);
});

// POST /loans -> cria um novo empréstimo

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Cria um novo empréstimo
 *     tags:
 *       - Empréstimos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_name
 *               - description
 *               - category_id
 *               - status_id
 *             properties:
 *               friend_name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date
 *               category_id:
 *                 type: integer
 *               status_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Empréstimo criado com sucesso.
 *       400:
 *         description: Dados obrigatórios ausentes.
 *       500:
 *         description: Erro ao criar empréstimo.
 */

app.post("/loans", async (req, res) => {
  const {
    friend_name,
    description,
    amount,
    due_date,
    category_id,
    status_id,
  } = req.body;

  if (!friend_name || !description || !category_id || !status_id) {
    return res.status(400).json({
      error:
        "friend_name, description, category_id e status_id são obrigatórios",
    });
  }

  const { data, error } = await supabase
    .from("loans")
    .insert([
      {
        friend_name,
        description,
        amount,
        due_date,
        category_id,
        status_id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar empréstimo:", error);
    return res.status(500).json({ error: "Erro ao criar empréstimo" });
  }

  res.status(201).json(data);
});

// PUT /loans/:id -> atualiza um empréstimo
/**
 * @swagger
 * /loans/{id}:
 *   put:
 *     summary: Atualiza um empréstimo existente
 *     tags:
 *       - Empréstimos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do empréstimo a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friend_name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               due_date:
 *                 type: string
 *                 format: date
 *               category_id:
 *                 type: integer
 *               status_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Empréstimo atualizado com sucesso.
 *       404:
 *         description: Empréstimo não encontrado.
 *       500:
 *         description: Erro ao atualizar empréstimo.
 */

app.put("/loans/:id", async (req, res) => {
  const { id } = req.params;

  const {
    friend_name,
    description,
    amount,
    due_date,
    category_id,
    status_id,
  } = req.body;

  const { data, error } = await supabase
    .from("loans")
    .update({
      friend_name,
      description,
      amount,
      due_date,
      category_id,
      status_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar empréstimo:", error);
    return res.status(500).json({ error: "Erro ao atualizar empréstimo" });
  }

  if (!data) {
    return res.status(404).json({ error: "Empréstimo não encontrado" });
  }

  res.json(data);
});

// DELETE /loans/:id -> exclui um empréstimo
/**
 * @swagger
 * /loans/{id}:
 *   delete:
 *     summary: Exclui um empréstimo existente
 *     tags:
 *       - Empréstimos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do empréstimo a ser excluído
 *     responses:
 *       204:
 *         description: Empréstimo excluído com sucesso.
 *       500:
 *         description: Erro ao excluir empréstimo.
 */

app.delete("/loans/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir empréstimo:", error);
    return res.status(500).json({ error: "Erro ao excluir empréstimo" });
  }

  res.status(204).send();
});

// ------------------------------------------------------
// Inicialização do servidor
// ------------------------------------------------------
const PORT = process.env.PORT || 3000;



swagger(app);


app.listen(PORT, () => {
  console.log(`API de Empréstimos rodando na porta ${PORT}`);
});
