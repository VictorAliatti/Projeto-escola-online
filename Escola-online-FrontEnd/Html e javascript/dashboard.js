// Este script vai rodar assim que a página dashboard.html carregar.
// Ele é o nosso "segurança" na porta.

// 1. Assim que o HTML carregar, execute a função principal 'verificarLogin'
document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
});

// 2. Esta é a nossa função principal de verificação
async function verificarLogin() {
    // 3. O segurança primeiro procura o crachá (token) no "porta-luvas" (localStorage)
    const token = localStorage.getItem('token');

    // 4. Verificação "Se NÂO houver crachá..."
    if (!token){
        console.log('Nenhum token encontrado. Redirecionando para login.');
        // Se não houver crachá, expulsa o usuário imediatamente
        // para a página de login.

        window.localStorage.href = 'login.html';
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
        } else  {
            // 7. SUCESSO! O crachá é válido!
            // O Back-End nos devolveu os dados do usuário
            const usuario = await response.json();

            console.log('Token válido. Bem-vindo', usuario.name);

            // Agora podemos, por exemplo, escrever o nome do usuário na página
            document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${usuario.name}!`;
        }
    } catch (error) {
        // 8. Se o Back-End estiver desligado (erro de rede)
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}