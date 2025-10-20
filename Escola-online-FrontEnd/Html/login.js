// Este script vai rodar na página login.html

const { FormData } = require("undici-types");

// 1. Espera o HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', ()=> {
    // 2. Seleciona o formulário de login
    // Demos um ID 'login-form' para ele no HTML
    const loginForm = document.getElementById('login-form');

    // 3. Seleciona a div de mensagens
    const messageDiv = document.getElementById('message');

    // 4. Adiciona um "ouvinte" para o evento 'submit' (envio) do formulário
    loginForm.addEventListener('submit', async (event) => {
        // 5. Impede o comportamento padrão do formulário (que é recarregar a página)
        event.preventDefault();

        // 6. Limpa mensagens de erro antigas
        messageDiv.textContent = '';
        messageDiv.className = '';

        // 7. Pega os dados do formulário
        // 'FormData' é uma forma moderna de pegar todos os campos
        const FormData = new FormData(loginForm);

        // Converte os dados para um formato que o back-end entende
        constdata = new URLSearchParams(formdata);

        try {
            // 8. Envia os dados para o Back-End "por debaixo dos panos"
            // Usamos a API 'fetch' do navegador
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                body: data // Envia os dados do formulário
            });

            // 9. Converte a resposta do servidor de JSON para um objeto JavaScript
            const result = await response.json();


            // 10. Verifica se a resposta do servidor foi um erro
            if (!responde.ok) {
                // Se foi um erro (status 404, 401, 500...),
                // mostra a mensagem de erro que o back-end enviou
                messageDiv.textContent = result.erro;
                messageDiv.className = 'message error';
            } else {
                // 11. SUCESSO!
                // Mostra a mensagem de sucesso
                messageDiv.textContent = result.mensagem;
                messageDiv.className = 'message success';

                // 12. Redireciona o usuário para o dashboard
                // Espera 1 segundo para o usuário poder ler a mensagem
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } catch (error) {
            // 13. Lidar com erros de rede (ex: back-end desligado)
            console.error('Erro na requisição', error);
            messageDiv.textContent = 'Não foi possivel conectar ao servidor';
            messageDiv.className = 'message error';
        }
    });
});