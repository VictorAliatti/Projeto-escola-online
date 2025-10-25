[Read in English](README.md)

---

# Projeto: Escola Online (Plataforma Full-Stack)

Bem-vindo ao projeto Escola Online, uma plataforma web full-stack para e-learning, construída do zero. Este projeto simula um ambiente de escola online profissional, com foco em um fluxo de **autenticação segura** e um **processo de matrícula de múltiplas etapas** para coletar dados detalhados dos alunos e responsáveis, garantindo a separação e segurança dos dados.

Este projeto está sendo construído com o objetivo de aprender e aplicar conceitos de desenvolvimento web Back-End, Front-End e Banco de Dados em um cenário do mundo real.

## Status do Projeto

**Em Desenvolvimento.**

A fundação do projeto (autenticação e matrícula) está completa. A próxima fase (Fase 8) envolverá a criação e exibição do conteúdo dos cursos.

## Funcionalidades (Features)

* **Autenticação Segura de Usuários:**
    * **Cadastro:** Criação de conta com nome, e-mail e senha.
    * **Criptografia de Senha:** As senhas são "hasheadas" usando `bcrypt` antes de serem salvas no banco de dados. Em nenhum momento a senha pura é armazenada.
    * **Login:** Autenticação de usuário que compara a senha fornecida com o hash salvo.
    * **Autenticação por Token (JWT):** Após o login, o servidor gera um "crachá" digital (JSON Web Token) que é armazenado no Front-End (`localStorage`).
    * **Rotas Protegidas:** O acesso a áreas sensíveis (como o Dashboard e o Perfil) é protegido por um *middleware* de segurança que valida o JWT.
    * **Logout Seguro:** A função de "Sair" destrói o token do `localStorage`, invalidando a sessão do usuário.

* **Fluxo de Matrícula em Duas Etapas:**
    1.  **Etapa 1 (Cadastro Rápido):** O usuário cria sua conta de login (nome, e-mail, senha). O sistema o marca internamente como `perfil_completo = false`.
    2.  **Etapa 2 (Matrícula Forçada):** Ao fazer o primeiro login, o sistema de segurança (Front-End + Back-End) identifica que o perfil está incompleto e **redireciona forçadamente** o usuário para uma página de "Completar Matrícula".
    3.  **Coleta de Dados Detalhada:** O usuário preenche um formulário extenso (17 campos) com dados pessoais, escolares e de responsáveis.
    4.  **Atualização de Status:** Ao salvar a matrícula, o sistema atualiza o "sinalizador" do usuário para `perfil_completo = true`.
    5.  **Acesso Liberado:** Em todos os logins futuros, o sistema verá `perfil_completo = true` e o levará diretamente para o Dashboard principal.

* **Segurança de Dados (Design de Banco de Dados):**
    * Os dados de **autenticação** (`usuarios`) são armazenados em uma tabela separada dos dados **pessoais e sensíveis** (`aluno_detalhes`).
    * Isso minimiza o risco de exposição de dados sensíveis (como CPF ou endereço) em caso de um ataque focado na lógica de autenticação.

## Arquitetura e Tecnologias Utilizadas

Este projeto utiliza uma arquitetura de 3 camadas (Front-End, Back-End, Banco de Dados) desacoplada.

### 1. Front-End

O Front-End é construído com "Vanilla Stack" (sem frameworks) para focar nos fundamentos do desenvolvimento web.

* **HTML5:** Estrutura semântica para todas as páginas.
* **CSS3:** Estilização centralizada (`estilo.css`) e responsividade (usando Media Queries).
* **JavaScript (ES6+):**
    * **`fetch` API:** Utilizada para toda a comunicação assíncrona com o Back-End.
    * **`async/await`:** Usado para gerenciar o fluxo das requisições.
    * **`localStorage`:** Utilizado para armazenar e gerenciar o "crachá" JWT.
    * **Manipulação de DOM:** Responsável por exibir mensagens de erro/sucesso e criar redirecionamentos dinâmicos.

### 2. Back-End

O Back-End é uma API RESTful construída em Node.js.

* **`Node.js`:** Ambiente de execução JavaScript no lado do servidor.
* **`Express.js`:** Framework para gerenciamento de rotas, *middlewares* e requisições HTTP.
* **`jsonwebtoken` (JWT):** Para criar e verificar os "crachás" de autenticação.
* **`bcrypt`:** Para criptografar e comparar as senhas dos usuários.
* **`pg` (node-postgres):** Driver para a comunicação entre o Node.js e o banco de dados PostgreSQL.
* **`cors`:** Middleware para permitir a comunicação entre o Front-End e o Back-End (que rodam em "origens" diferentes).

### 3. Banco de Dados

* **`PostgreSQL`:** Sistema de Gerenciamento de Banco de Dados Relacional (SGBDR) robusto e de nível profissional.
* **`pgAdmin 4`:** Ferramenta de interface gráfica utilizada para modelar e gerenciar o banco de dados.

## Modelagem de Dados (Schema do Banco)

O banco de dados `escola_online` possui duas tabelas principais que se relacionam:

### Tabela: `usuarios`

Armazena os dados de autenticação e o "sinalizador" de matrícula.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key** | Identificador único do usuário. |
| `nome` | `character varying` | Not NULL | Nome do usuário (coletado no 1º cadastro). |
| `email` | `character varying` | Not NULL, **Unique**| E-mail de login (único). |
| `senha_hash`| `character varying` | Not NULL | Senha criptografada com `bcrypt`. |
| `perfil_completo`| `boolean` | Not NULL, **Default: false**| "Sinalizador" que controla o fluxo de matrícula. |

### Tabela: `aluno_detalhes`

Armazena os dados sensíveis e pessoais da "ficha de matrícula".

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `bigserial` | **Primary Key** | Identificador único da ficha. |
| `usuario_id`| `bigint` | Not NULL, **Foreign Key** | O "gancho" que liga esta ficha ao `id` da tabela `usuarios`. |
| `cpf_aluno` | `character varying` | | CPF do aluno. |
| `data_nascimento` | `date` | | Data de nascimento do aluno. |
| `contato_aluno`| `character varying` | | |
| `cidade_uf_aluno` | `character varying` | | |
| `endereco_aluno`| `character varying` | | |
| `tipo_escola` | `character varying` | | (Pública ou Particular) |
| `nome_escola` | `character varying` | | |
| `ano_escola` | `character varying` | | (Ex: "6º Ano Fundamental") |
| `info_importantes` | `text` | | (Campo de texto longo para observações). |
| `nome_responsavel` | `character varying` | Not NULL | |
| `cpf_responsavel` | `character varying` | | |
| `parentesco` | `character varying` | | |
| `contato_responsavel`| `character varying` | Not NULL | |
| `endereco_responsavel`| `character varying` | | |
| `cidade_uf_responsavel`| `character varying` | | |

## Documentação da API (Endpoints)

Abaixo estão as rotas da API criadas no `server.js`:

| Método | Rota | Protegida? | Descrição |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/cadastro` | **Não** | Recebe `nome`, `email`, `senha`. Cria um novo usuário na tabela `usuarios` com `perfil_completo = false`. |
| **`POST`** | `/login` | **Não** | Recebe `email`, `senha`. Compara a senha com o hash no banco. Se for sucesso, retorna um `token` JWT. |
| **`GET`** | `/api/perfil` | **Sim (JWT)** | Rota de verificação. Valida o JWT, busca o usuário no banco e retorna seus dados (incluindo `perfil_completo`). |
| **`POST`** | `/api/completar-perfil` | **Sim (JWT)** | Recebe os 17 campos da matrícula. Usa o `id` do JWT para: **1.** Iniciar uma Transação; **2.** `INSERT` na tabela `aluno_detalhes`; **3.** `UPDATE` na tabela `usuarios` para `perfil_completo = true`; **4.** `COMMIT` da Transação. |

## Como Executar o Projeto Localmente

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/VictorAliatti/Projeto-escola-online.git]
    cd [Escola-Online]
    ```

2.  **Configurar o Banco de Dados (PostgreSQL)**
    * Abra o `pgAdmin 4`.
    * Crie um novo banco de dados (Database) chamado `escola_online`.
    * Abra o "Query Tool" (Ferramenta de Consulta) para este banco.
    * Execute os seguintes scripts SQL para criar as tabelas:

    ```sql
    -- Script para criar a tabela usuarios
    CREATE TABLE public.usuarios (
        id bigserial NOT NULL,
        nome varchar NOT NULL,
        email varchar NOT NULL,
        senha_hash varchar NOT NULL,
        perfil_completo boolean NOT NULL DEFAULT false,
        CONSTRAINT usuarios_email_key UNIQUE (email),
        CONSTRAINT usuarios_pkey PRIMARY KEY (id)
    );

    -- Script para criar a tabela aluno_detalhes
    CREATE TABLE public.aluno_detalhes (
        id bigserial NOT NULL,
        usuario_id bigint NOT NULL,
        cpf_aluno varchar NULL,
        data_nascimento date NULL,
        contato_aluno varchar NULL,
        cidade_uf_aluno varchar NULL,
        endereco_aluno varchar NULL,
        tipo_escola varchar NULL,
        nome_escola varchar NULL,
        ano_escola varchar NULL,
        info_importantes text NULL,
        nome_responsavel varchar NOT NULL,
        cpf_responsavel varchar NULL,
        parentesco varchar NULL,
        contato_responsavel varchar NOT NULL,
        endereco_responsavel varchar NULL,
        cidade_uf_responsavel varchar NULL,
        CONSTRAINT aluno_detalhes_pkey PRIMARY KEY (id),
        CONSTRAINT fk_aluno_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
    );
    ```

3.  **Configurar o Back-End**
    * Navegue até a pasta do back-end: `cd Escola-Online-Backend`
    * Instale as dependências: `npm install`
    * **Importante:** Abra o arquivo `server.js` em um editor.
    * Encontre o objeto `new Pool({...})`.
    * Atualize o campo `password: 'SUA_SENHA_DO_POSTGRES'` com a senha que você criou durante a instalação do PostgreSQL.

4.  **Rodar o Back-End**
    * No terminal, dentro da pasta `Escola-Online-Backend`, execute:
    ```bash
    npm run dev
    ```
    * O servidor estará rodando em `http://localhost:3000`.

5.  **Executar o Front-End**
    * Navegue até a pasta `Escola-online-FrontEnd`.
    * Dê um duplo-clique no arquivo `index.html` (ou `cadastro.html`) para abrir a aplicação no seu navegador.

## Próximos Passos (Roadmap)

* **Fase 8 (Conteúdo):** Criar as tabelas `cursos` e `aulas`. Criar rotas de API para buscar os cursos e exibi-los no dashboard para alunos com perfil completo.
* **Fase 9 (Gamificação):** Implementar a visão de "Duolingo" (avatares, sistema de pontos, medalhas) com novas tabelas no banco de dados.
* **Fase 10 (Pagamentos):** Integrar um Gateway de Pagamento (como Stripe ou Mercado Pago) para gerenciar o acesso aos cursos.