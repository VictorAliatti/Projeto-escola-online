// Este script vai controlar a página completar_perfil.html

// 1. Assim que o HTML carregar, execute a função principal
document.addEventListener('DOMContentLoaded', () => {

    // --- Missão 1: "Segurança" (Verificar se está logado) ---
    // (Vamos "roubar" a lógica do dashboard.js)
    // Nós não queremos que esta função seja 'async'
    // Vamos apenas chamar a verificação.
    const token = localStorage.getItem('token');
    if (!token){
        // Se não tem crachá, não pode estar aqui. Expulsa!
        console.log('Nenhum token encontrado. Redirecionando para login.');
        window.location.href = 'login.html';
        return; //Para o script
    }

    // --- Missão 2: Fazer o botão "Sair" funcionar ---
    // (Exatamente o mesmo código do dashboard.js)
    const logoutLink = document.getElementById('logout-link');
    logoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        fazerLogout();
    });

    // --- Missão 3: "Ouvir" o envio do formulário ---
    // 3.1. Encontra o formulário pelo "apelido" (ID)
    const perfilForm = document.getElementById('perfil-form');
    // 3.2. Encontra a caixa de mensagem
    const messageDiv = document.getElementById('message');

    // 3.3. Adiciona o "ouvinte" de envio (submit)
    perfilForm.addEventListener('submit', async (event) => {
        // Impede a página de recarregar
        event.preventDefault();

        // Limpa mensagens antigas
        messageDiv.textContent = '';
        messageDiv.className = '';

        // 3.4. Pega o crachá (token) do porta-luvas
        // Precisamos enviar o crachá para o Back-End saber
        // DE QUEM são esses dados que estamos salvando.
        const token = localStorage.getItem('token');
        // (Já checamos se ele existe lá em cima)

        // 3.5. Pega todos os 17 campos do formulário
        const formData = new FormData(perfilForm);

        // Converte os dados para o formato que o back-end entende
        const data = new URLSearchParams(formData);

        try{
            // 3.6. Envia os dados para a NOVA ROTA no Back-End
            // (Esta rota ainda não existe, vamos criá-la depois)
            const response = await fetch ('http://localhost:3000/api/completar-perfil', {
                method: "POST",
                headers: {
                    // Envia o crachá para o Back-End saber QUEM está enviando
                    'Authorization': `Bearer ${token}`
                },
                body: data // Envia os 17 campos
            });

            const result = await response.json();

            if (!response.ok) {
                // Se o back-end der erro
                messageDiv.textContent = result.erro;
                messageDiv.className = 'message error';
            } else {
                // 3.7. SUCESSO! Perfil salvo!
                messageDiv.textContent = result.mensagem;
                messageDiv.className = 'message success';

                // 3.8. Redireciona para o Dashboard principal
                // (agora sim, ele pode ver os cursos!)
                setTimeout(() => {
                    window.location.href ='dashboard.html';
                }, 2000); // Espera 2 segundos
            }
        } catch (error) {
            console.error('Erro ao salvar o perfil', error);
            messageDiv.textContent = 'Erro ao conectar com o servidor.';
            messageDiv.className = 'message error';
        }
    });
});

// --- Função de Logout (Missão 2) ---
// (Exatamente a mesma função do dashboard.js)
function fazerLogout() {
    console.log('Fazendo logout... Destruindo o token');
    localStorage.removeItem('token');
    window.location.href = 'login.html'
}