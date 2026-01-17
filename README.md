# Explorando vulnerabilidades a partir de OAuth & Stored XSS

Este projeto foi desenvolvido para demonstrar a exploração de vulnerabilidades **Stored XSS** em aplicações web para comprometer fluxos de autenticação **OAuth**. O cenário simula o roubo de sessões e *Account Takeover* via exfiltração de tokens de acesso do GitHub.

> Foi desenvolvido estritamente para fins educacionais e acadêmicos.

## Estrutura do Projeto

* **vulnerable_app.js**: Aplicação alvo (Blog) contendo a falha de segurança.
* **attacker.js**: Servidor de Comando e Controle que recebe os dados.

## Pré-requisitos

* Node.js (v14 ou superior)
* NPM (Node Package Manager)

## Instalação

1.  Clone este repositório ou baixe os arquivos para uma pasta local.
2.  No terminal, navegue até a pasta do projeto e instale as dependências necessárias:

```bash
npm init -y
npm install express axios body-parser dotenv

