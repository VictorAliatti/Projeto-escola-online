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

// ===============================================
// <-- INÍCIO DO NOVO BLOCO (FASE 6)
// ===============================================
// Importa a biblioteca do crachá

const jwt = require('jsonwebtoken');
// Define uma "senha secreta" para assinar nossos crachás.
// Isso garante que SÓ o nosso servidor pode criar crachás válidos.

const JWT_SECRET = 'seu-segredo-super-secreto-12345';

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

// ===============================================
// <-- INÍCIO DO NOVO BLOCO (FASE 7)
// ===============================================
// Middleware de Autenticação (Nosso "Segurança")

function verificarToken(req, res, next) {
    // 1. O segurança procura o crachá no cabeçalho 'authorization'
    const authHeader = req.headers['authorization'];

    // O cabeçalho vem no formato "Bearer [token]"
    // 'split(' ')[1]' pega só a parte do token
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Se não foi enviado um crachá (token), barra a entrada
    if (token == null) {
        console.log('Middleware: Token não encontrado. Acesso negado');
        return res.status(401).json({ erro:"Acesso não autorizado: token não fornecido"});
    }

    // 3. O segurança verifica a assinatura do crachá
    jwt.verify(token, JWT_SECRET, (err, usuarioDecodificado) => {

        if (err) {
            console.log('Middleware: Token inválido!', err.message);
            return res.status(403).jason({ erro: "Acesso proibido: token inválido ou expirado."});
        }

        // 5. SUCESSO! O crachá é válido.
        // O segurança "carimba" a requisição com os dados do usuário
        // para que a rota final possa usá-los.
        req.usuario = usuarioDecodificado;
        
        // 6. O segurança diz: "Pode passar para a próxima etapa (a rota)"
        next();
    });
}

// ===============================================
// <-- FIM DO NOVO BLOCO (FASE 7)
// ===============================================

// 4. Criar uma "rota" de teste (vamos manter)
app.get('/api/perfil', (req, res) => {
    res.json({ mensagem: "Servidor está no ar!" });
});

// ===============================================
// INÍCIO: ROTA DE CADASTRO 
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

// ===============================================
// INÍCIO: ROTA DE LOGIN
// ===============================================

// 4.2. Rota de Login (POST /login)
app.post('/login', async (req, res) => {
    
    // 1. Pegar os dados do formulário de login
    const { email, senha } = req.body;
    console.log('Recebida requisição de login:');
    console.log('Email:', email);

    try {
        // 2. Procurar o usuário no banco de dados pelo e-mail
        const consultaUsuario = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        // 3. Verificar se o usuário foi encontrado
        // "rowCount" é o número de linhas que a consulta encontrou.
        if (consultaUsuario.rowCount === 0) {
            // Se não encontrou (0 linhas), o usuário não existe.
            console.log('Tentativa de login: Usuário não encontrado.');
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        // 4. Se encontrou, pegar os dados do usuário
        const usuario = consultaUsuario.rows[0];
        
        // 5. Comparar a senha digitada com a senha "hash" salva no banco
        // O bcrypt.compare faz essa mágica para nós.
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaCorreta) {
            // Se a comparação falhar, as senhas não batem.
            console.log('Tentativa de login: Senha incorreta.');
            return res.status(401).json({ erro: "Senha incorreta." });
        }


        // 6. SUCESSO!
        // O e-mail existe E a senha está correta.
        console.log('Login bem-sucedido para:', usuario.email);

        // 7. Criar o "Crachá" (Token)
        const token = jwt.sign(
            { 
                id: usuario.id,
                nome: usuario.nome
            },
            JWT_SECRET,
            { 
                expiresIn: '8h' // Crachá expira em 8 horas
            } 
        );

        console.log('Token JWT criado:', token);

        // 8. Enviar o Crachá (token) de volta para o Front-End
        res.status(200).json({ mensagem: "Login bem-sucedido!",
        token: token // O crachá digital!
        });

        //================================================
        // <-- FIM DA MODIFICAÇÃO (FASE 6)
        // ===============================================


    } catch (err) {
        // 7. Lidar com erros inesperados
        console.error('Erro ao fazer login:', err.message);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

// ===============================================
// FIM: ROTA DE LOGIN
// ===============================================

// 5. "Ligar" o servidor
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
    console.log('Pressione Ctrl+C para parar o servidor.');
});