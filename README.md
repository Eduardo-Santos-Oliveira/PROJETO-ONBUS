
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

![Image](https://github.com/user-attachments/assets/cebab595-9adb-4969-bbd0-a90b312ad626)
![Image](https://github.com/user-attachments/assets/ed356cb2-59a1-4b68-b443-fd55a5d7f2ef)
![Image](https://github.com/user-attachments/assets/b8bf841d-85bd-45c2-bed9-8eb1b61b5cc0)
![Image](https://github.com/user-attachments/assets/48bf0564-a949-4b26-8a7d-a48ddaabb9f6)
![Image](https://github.com/user-attachments/assets/9d66634f-db52-443a-ad98-9db71c18e541)
![Image](https://github.com/user-attachments/assets/d59b315c-0781-46a8-915b-cea67220486c)
![Image](https://github.com/user-attachments/assets/9e694e4e-0d4f-4b08-8436-d6448443cdd4)

<div align="center">
  <img src="https://github.com/user-attachments/assets/425b625a-921e-4a06-9195-61ba7c0cd074" width="300px" />
  <img src="https://github.com/user-attachments/assets/97ab31f5-4a9d-431f-9419-faa65568bdea" width="300px" />
  <img src="https://github.com/user-attachments/assets/f3b9a449-a4d3-402b-9648-c30d5bdcf34c" width="300px" />
  <img src="https://github.com/user-attachments/assets/abb1c59c-e2a4-4c9d-a40b-f8c030010c11" width="300px" />
  <img src="https://github.com/user-attachments/assets/78d608f1-85f7-4c4d-b600-e1c04afd0b63" width="300px" />
  <img src="https://github.com/user-attachments/assets/689ac63d-256e-4d34-8cde-ff6ecd2a5727" width="300px" />
</div>




---

## 👨‍💻 Autores

- Nome: Eduardo Oliveira - Backend
- Email: eduardo.santos.oliveira.exe@gmail.com
- GitHub: https://github.com/Eduardo-Santos-Oliveira

---


🌟 **Sinta-se à vontade para contribuir, dar sugestões ou relatar bugs!**
