// 1. Importar a ferramenta Express
const express = require('express');

// ===============================================
// INÍCIO: SEÇÃO DE BANCO DE DADOS
// ===============================================

// 1.1. Importar o "tradutor" (pacote node-postgres)
const { Pool } = require('pg');

// 1.2. Configurar os dados da conexão
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'escola_online',
    password: 'victor0229', // !! TROQUE PELA SUA SENHA !!
    port: 5432,
});

// 1.3. Testar a conexão (vamos manter, é bom)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados!', err.stack);
    } else {
        console.log('Conexão com o banco de dados estabelecida!');
    }
});
// ===============================================
// FIM: SEÇÃO DE BANCO DE DADOS
// ===============================================

// ===============================================
// INÍCIO: NOVAS FERRAMENTAS
// ===============================================

// Importar o 'cors' para permitir comunicação entre front e back
const cors = require('cors');

// Importar o 'bcrypt' para criptografar senhas
const bcrypt = require('bcrypt');
const saltRounds = 10; // "Força" da criptografia

// ===============================================
// FIM: NOVAS FERRAMENTAS
// ===============================================

// 2. Iniciar o Express
const app = express();

// 3. Definir uma "porta"
const PORTA = 3000;

// ===============================================
// INÍCIO: MIDDLEWARES (Os "Tradutores" do Express)
// ===============================================

// 3.1. Habilitar o CORS
// Isso diz ao navegador: "Confie neste Back-End e deixe o Front-End falar com ele."
app.use(cors());

// 3.2. Tradutor de JSON
// Ensina o Express a "ler" o JSON que o front-end pode enviar
app.use(express.json());

// 3.3. Tradutor de Formulários (URL-encoded)
// Ensina o Express a "ler" os dados vindos do <form> do HTML
app.use(express.urlencoded({ extended: true }));

// ===============================================
// FIM: MIDDLEWARES
// ===============================================


// 4. Criar uma "rota" de teste (vamos manter)
app.get('/', (req, res) => {
    res.json({ mensagem: "Servidor está no ar!" });
});

// ===============================================
// INÍCIO: ROTA DE CADASTRO (O CORAÇÃO DA FASE 4)
// ===============================================

// 4.1. Rota de Cadastro (POST /cadastro)
// app.post() significa que esta rota espera RECEBER dados (diferente de app.get())
app.post('/cadastro', async (req, res) => {
    
    // 1. Pegar os dados do formulário
    // O "req.body" (corpo da requisição) contém os dados do formulário
    // Os nomes (nome, email, senha) vêm do atributo "name" dos <input> no HTML
    const { nome, email, senha } = req.body;

    console.log('Recebida requisição de cadastro:');
    console.log('Nome:', nome, 'Email:', email);

    try {
        // 2. Criptografar a senha
        // NUNCA salve a senha pura! Usamos o bcrypt.
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        console.log('Senha criptografada:', senhaHash);

        // 3. Inserir no Banco de Dados
        // Usamos $1, $2, $3 como "placeholders" para evitar
        // um tipo de ataque hacker chamado "SQL Injection".
        const novoUsuario = await pool.query(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING *",
            [nome, email, senhaHash]
        );

        console.log('Usuário salvo no banco:', novoUsuario.rows[0]);

        // 4. Responder ao Front-End
        // Se tudo deu certo, enviamos uma mensagem de sucesso
        res.status(201).json({ mensagem: "Usuário criado com sucesso!", usuario: novoUsuario.rows[0] });

    } catch (err) {
        // 5. Lidar com Erros
        console.error('Erro ao cadastrar usuário:', err.message);

        // O código '23505' é o código de erro do PostgreSQL para "violação de restrição única"
        // (ou seja, o e-mail que tentamos cadastrar já existe, por causa da regra que criamos!)
        if (err.code === '23505') {
            return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
        }
        
        // Outro erro qualquer
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

// ===============================================
// FIM: ROTA DE CADASTRO
// ===============================================


// 5. "Ligar" o servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
    console.log('Pressione Ctrl+C para parar o servidor.');
});