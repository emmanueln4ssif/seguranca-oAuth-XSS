require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); 
const app = express();
const port = 3000;


const CLIENT_ID = process.env.GH_CLIENT_ID;
const CLIENT_SECRET = process.env.GH_CLIENT_SECRET;


app.use(bodyParser.urlencoded({ extended: true }));

let postComments = [];

//template do Blog com seção de comentários vulnerável a XSS
const htmlTemplate = (comments, scriptInjecao = '') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>CodePlace | O fórum dos desenvolvedores</title>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #0d1117; --card: #161b22; --border: #30363d; --text: #c9d1d9; --accent: #58a6ff; }
        body { font-family: 'Inter', sans-serif; margin: 0; background: var(--bg); color: var(--text); line-height: 1.6; }
        
        /* Navbar estilo GitHub */
        .nav { background: #161b22; padding: 15px 10%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
        .logo { font-weight: 800; font-size: 1.2rem; color: #f0f6fc; letter-spacing: -0.5px; font-family: 'Fira Code', monospace; }
        .logo span { color: var(--accent); }
        
        /* Layout do Post */
        .container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
        .post-header h1 { font-size: 2.5rem; color: #f0f6fc; margin-bottom: 10px; line-height: 1.1; }
        .meta { color: #8b949e; font-size: 0.9rem; margin-bottom: 30px; display: flex; gap: 15px; align-items: center; }
        .author-img { width: 30px; height: 30px; border-radius: 50%; background: #30363d; }
        
        .content { font-size: 1.1rem; color: #c9d1d9; margin-bottom: 50px; }
        .code-block { background: #0d1117; border: 1px solid var(--border); padding: 15px; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 0.9rem; color: #ff7b72; margin: 20px 0; }

        /* Auth Button */
        .btn-github { background: #238636; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem; border: 1px solid rgba(240,246,252,0.1); transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-github:hover { background: #2ea043; }

        /* Comentários (Vulnerável) */
        .comments-section { margin-top: 60px; border-top: 1px solid var(--border); padding-top: 40px; }
        .comment-box { background: var(--card); padding: 20px; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 15px; }
        .comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 0.85rem; color: #8b949e; }
        
        input[type="text"] { background: #0d1117; border: 1px solid var(--border); color: white; padding: 12px; width: 100%; border-radius: 6px; margin-top: 10px; font-family: inherit; box-sizing: border-box; }
        input:focus { outline: none; border-color: var(--accent); }
        
        .btn-submit { margin-top: 10px; background: var(--card); border: 1px solid var(--border); color: var(--accent); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-submit:hover { background: #30363d; }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="logo">&lt;Code<span>Verse</span>/&gt;</div>
        <div id="auth-area">
            <a href="https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user:email" class="btn-github">                
                Sign in with GitHub
            </a>
        </div>
    </nav>

    <div class="container">
        <article class="post-header">
            <h1>Por que você deve parar de usar 'console.log' hoje mesmo</h1>
            <div class="meta">
                <div class="author-img"></div>
                <span>Steve Jobs • 17 Jan 2026 • 2 min read</span>
            </div>
            
            <div class="content">
                <p>Muitos desenvolvedores dependem do console para debugar, mas ferramentas modernas oferecem muito mais poder...</p>
                <div class="code-block">debugger; // Use isso ao invés de console.log()</div>
                <p>Neste artigo, vamos explorar breakpoints condicionais e watch expressions.</p>
            </div>
        </article>

        <div class="comments-section">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Discussão (${comments.length})</h3>
                <a href="/limpar" style="color:#ff7b72; font-size:0.8rem; text-decoration:none;">[ Resetar Database ]</a>
            </div>

            <div id="comments-list">
                ${comments.length ? comments.map(c => `<div class="comment-box">${c}</div>`).join('') : '<div style="color:#8b949e; font-style:italic;">Seja o primeiro a comentar.</div>'}
            </div>

            <div style="margin-top: 30px;">
                <form action="/comentar" method="POST">
                    <label style="font-size:0.9rem; color:#8b949e;">Deixe seu comentário...</label>
                    <input type="text" name="comentario" placeholder="Escreva algo inteligente..." autocomplete="off">
                    <button type="submit" class="btn-submit">Publicar Comentário</button>
                </form>
            </div>
        </div>
    </div>

    ${scriptInjecao}

    <script>
        

        function logout() {
            // Remove o token e o usuário do navegador
            localStorage.removeItem('gh_access_token');
            localStorage.removeItem('gh_user');
            
            // Recarrega a página para voltar ao estado de "Visitante"
            window.location.href = '/';
        }

        // 2. Lógica de Front: Verifica se logou com GitHub
        const token = localStorage.getItem('gh_access_token');
        const user = localStorage.getItem('gh_user');
        
        if(token) {
            const authArea = document.getElementById('auth-area');
            
            // Renderiza o perfil E o botão de Sair
            authArea.innerHTML = \`
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:0.9rem; text-align:right; line-height:1.2;">
                            <div style="color:#c9d1d9;">\${user}</div>
                            <div style="font-size:0.7rem; color:#58a6ff;">Dev Mode</div>
                        </span>
                        <img src="https://github.com/\${user}.png" style="width:36px; height:36px; border-radius:50%; border:2px solid #30363d;">
                    </div>
                    
                    <button onclick="logout()" style="background:transparent; border:1px solid #da3633; color:#da3633; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600; transition:0.2s;">
                        Sign out
                    </button>
                </div>
            \`;
        }

        

    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlTemplate(postComments));
});


app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send('Erro: Sem código.');

    try {
        //  toca Code por Token
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code
        }, { headers: { accept: 'application/json' } });

        const token = response.data.access_token;
        if(!token) return res.send('Erro de Token: ' + JSON.stringify(response.data));

        // pega dados do usuário
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
        });

        // salva no LocalStorage (erro de segurança)
        const script = `
            <script>
                localStorage.setItem('gh_access_token', '${token}');
                localStorage.setItem('gh_user', '${userRes.data.login}');
                window.location.href = '/';
            </script>
        `;
        res.send(htmlTemplate(postComments, script));

    } catch (e) { console.error(e); res.send('Erro GitHub'); }
});

app.post('/comentar', (req, res) => {
    if(req.body.comentario) postComments.push(req.body.comentario);
    res.redirect('/');
});

app.get('/limpar', (req, res) => { postComments = []; res.redirect('/'); });

app.listen(port, () => {
    console.log(`Blog rodando: http://localhost:${port}`);
});