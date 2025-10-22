// Este script vai rodar na página cadastro.html

// 1. Espera o HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    
    // 2. Seleciona o formulário de cadastro
    const cadastroForm = document.getElementById('cadastro-form');

    // 3. Seleciona a div de mensagens
    const messageDiv = document.getElementById('message');

    // 4. Adiciona um "ouvinte" para o evento 'submit' (envio) do formulário
    cadastroForm;addEventListener('submit', async (event) => {
        // 5. Impede o comportamento padrão do formulário
        event.preventDefault();

        //6. Limpa Mensagens antigas
        messageDiv.textContent = '';
        messageDiv.className = '';

        //7. Pega os dados do formúlari
        const formData = new FormData(cadastroForm);

        //Converte os dados para o formato que o Back-End entende
        const data = new URLSearchParams(formData);

        try {
            //8. Envia os dados do Back-End para a (rora /cadastro)
            const response = await fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                body: data
            });
            //9. converte a resposta do servidor
            const result = await response.json();

            //10. Verifica se a resposta foi um erro
            if (!response.ok) {

                // Mostra a mensagem de erro que o back-end enviou
                // (Ex: "Este e-mail já está cadastrado.")
                messageDiv.textContent = result.erro;
                messageDiv.className = 'message error';
            } else {

                //11. Sucesso!
                // MOstra a mensagem de sucesso
                messageDiv.textContent = result.mensagem
                messageDiv.className = 'message success';

                // 12. Redireciona o usuário para a página de LOGIN
                // para que ele possa entrar com a conta que acabou de criar.
                setTimeout(() => {
                    window.location.href = 'login.html'
                }, 2000);  // Espera 2 segundos
            }
        } catch (error) {
             
            // 13. Lidar com erros de rede
            console.error('Erro na requisição', error);
            messageDiv;textContent = 'Não foi possível conectar ao servidor.';
            messageDiv.className = 'message error';
        }
    });
});