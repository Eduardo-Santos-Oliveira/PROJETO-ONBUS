
# 🚌 ONBUS - Consulta de Ônibus em Tempo Real

O **ONBUS** é uma aplicação web projetada para facilitar a consulta de horários, itinerários e linhas de ônibus de forma rápida, simples e intuitiva. O projeto foi desenvolvido para atender às necessidades dos usuários do transporte público, proporcionando uma experiência acessível, moderna e eficiente.

---

## 📦 Estrutura do Projeto

```
PROJETO-ONBUS-main/
├── login.html           # Página de login
├── login.css            # Estilo da página de login
├── login.js             # Lógica de autenticação
├── pesquisa.html        # Página principal de pesquisa de ônibus
├── pesquisa.css         # Estilo da interface de busca
├── pesquisa.js          # Scripts e interatividade
├── linhas_com_links.json              # Dados de linhas com links
├── linhas_com_horarios_e_rotas.json  # Horários e rotas completas
├── raspador_smtu_completo.py         # Raspador de dados da SMTU
├── server.js            # Backend com Node.js/Express
├── vercel.json          # Configuração para deploy na Vercel
├── package.json         # Dependências do Node.js
└── package-lock.json    # Versões exatas das dependências
```

---

## 🧠 Funcionalidades

- 🔍 Pesquisa por linha de ônibus
- 🗺️ Exibição de horários e rotas em tempo real
- ⚠️ Avaliação de segurança da parada de ônibus
- 📂 Interface limpa e acessível
- 🔐 Tela de login simples para controle de acesso
- 🌐 Backend em Node.js com API de consulta
- 🐍 Raspador em Python para extrair dados da SMTU

---

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/PROJETO-ONBUS.git
cd PROJETO-ONBUS
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute o servidor
```bash
node server.js
```

Acesse o projeto em `http://localhost:3000`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript puro
- **Backend:** Node.js + Express
- **Dados:** JSON gerado via scraping com Python
- **Deploy:** Railway

---

## 🐍 Raspagem de Dados (SMTU)

O script `raspador_smtu_completo.py` acessa os dados da SMTU para coletar informações atualizadas sobre as linhas de ônibus, gerando arquivos JSON que são utilizados na interface web.

---

## 📸 Capturas de Tela

<img src="./path/to/screenshot1.png" width="400"/>
<img src="./path/to/screenshot2.png" width="400"/>
<img src="./path/to/screenshot3.png" width="400"/>



---

## 👨‍💻 Autores

- Nome: Eduardo Oliveira - Backend
- Email: eduardo.santos.oliveira.exe@gmail.com
- GitHub: https://github.com/Eduardo-Santos-Oliveira

---


🌟 **Sinta-se à vontade para contribuir, dar sugestões ou relatar bugs!**
