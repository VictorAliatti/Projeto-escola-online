// Este script vai rodar assim que a página dashboard.html carregar.
// Ele é o nosso "segurança" na porta.

// 1. Assim que o HTML carregar, execute a função principal 'verificarLogin'
document.addEventListener('DOMContentLoaded', () => {
    // ===============================================
    // <-- INÍCIO DO NOVO CÓDIGO (1 de 3)
    // ===============================================
    // 1.1. Pega o link "Sair" que tem o ID 'logout-link'
    const logoutLink = document.getElementById('logout-link');

    // 1.2. Adiciona um "ouvinte" de clique nele
    logoutLink.addEventListener('click', (event) => {

        // Impede o link de navegar para 'index.html' imediatamente
        event.preventDefault();

        // Chama a nossa nova função de logout (que vamos criar abaixo)
        fazerLogout();
    });

    // ===============================================
    // <-- FIM DO NOVO CÓDIGO (1 de 3)
    // ===============================================

    // 1.3. Roda a verificação de segurança (esta linha já existia)
    verificarLogin();
});

// 2. Esta é a nossa função principal de verificação
async function verificarLogin() {
    // 3. O segurança primeiro procura o crachá (token) no "porta-luvas" (localStorage)
    const token = localStorage.getItem('token');

    // 4. Verificação "Se NÂO houver crachá..."
    if (!token) {
        console.log('Nenhum token encontrado. Redirecionando para login.');
        // Se não houver crachá, expulsa o usuário imediatamente
        // para a página de login.

        window.location.href = 'login.html';
        return; // Para a execução do script
    }

    // 5. Verificação "Se HOUVER crachá..."
    // O segurança precisa verificar se o crachá é válido (não é falso ou antigo).
    // Para isso, ele envia o crachá para o Back-End.
    try {
        const response = await fetch ('http://localhost:3000/api/perfil', {
            method: "GET",
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        // 6. O segurança analisa a resposta do Back-End
        if (!response.ok) {

            // Se o Back-End disse que a resposta "Não é OK" (ex: 401 Não Autorizado)
            // significa que o crachá é inválido ou expirou.
            console.log('Token inválido. Redirecionando para login.');

            // Limpa o crachá inválido do porta-luvas
            localStorage.removeItem('token');

            // Expulsa o usuário
            window.location.href = 'login.html'

        } else {
            // 7. SUCESSO! O crachá é válido!
            // O back-end nos enviou { id, nome, perfil_completo }
            const usuario = await response.json();

            // ===============================================
            // <-- INÍCIO DA MODIFICAÇÃO (FASE 7.H)
            // ===============================================
            // 7.1. O "Controlador de Tráfego"
            // Verificamos o "sinalizador" que o Back-end nos enviou
            if (usuario.perfil_completo === false) {

                // 7.2. Se for 'false', o perfil está incompleto.
                // Redireciona para a página de matrícula.
                console.log('Perfil incompleto. Redirecionando para completar_perfil.html ');
                window.location.href = 'completar_perfil.html';
            } else {

                // 7.3. Se for 'true', o perfil está completo.
                // Deixa o usuário ficar no dashboard e mostra a mensagem.
                console.log('Token válido. Perfil completo. Bem-Vindo', usuario.nome);
                document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${usuario.nome}!`;;
            }
        }
        
    } catch (error) {
        // 8. Se o Back-End estiver desligado (erro de rede)
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// ===============================================
// <-- FIM DA MODIFICAÇÃO (FASE 7.H)
// ===============================================

// ===============================================
// <-- INÍCIO DO NOVO CÓDIGO (2 de 3)
// ===============================================
// 3. Nossa nova função de Logout
function fazerLogout() {
    console.log('Fazendo logout... Destruindo o token.');
    
    // 1. Destrói o crachá (apaga o token do porta-luvas)
    localStorage.removeItem('token');
    
    // 2. Redireciona para a página de login
    window.location.href = 'login.html';
}
// ===============================================
// <-- FIM DO NOVO CÓDIGO (2 de 3)
// ===============================================