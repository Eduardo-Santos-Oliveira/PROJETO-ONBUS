const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('1006485668370-pbnmae0bkslevk20pkjmh4mgg7o1trj2.apps.googleusercontent.com');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = 3000;
const SECRET_KEY = 'minha_chave_super_secreta';
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});
module.exports = pool;


let linhasData = [];
try {
    const jsonPath = path.join(__dirname, 'linhas_com_horarios_e_rotas.json');
    linhasData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log('Dados das linhas carregados com sucesso');
} catch (err) {
    console.error('Erro ao carregar arquivo JSON:', err.message);
    console.log('Usando array vazio como fallback');
}
async function setupDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS avaliacoes_paradas (
                coordenadas_id VARCHAR(50) PRIMARY KEY,
                latitude DECIMAL(10, 6) NOT NULL,
                longitude DECIMAL(10, 6) NOT NULL,
                avaliacao VARCHAR(20) NOT NULL,
                comentario TEXT,
                anonimo BOOLEAN DEFAULT false,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Tabela verificada/criada com sucesso');
    } catch (error) {
        console.error('Erro ao verificar/criar tabela:', error);
    }
}
setupDatabase();
app.get('/api/linhas', (req, res) => {
    res.json({ success: true, data: linhasData });
});
app.get('/api/linhas/pesquisa', (req, res) => {
    const termo = req.query.termo ? req.query.termo.toLowerCase().trim() : '';
    const bairro = req.query.bairro ? req.query.bairro.toLowerCase().trim() : '';
    const resultados = linhasData.filter(linha => {
        const nomeMatch = termo && linha.nome.toLowerCase().includes(termo);
        let bairroMatch = true;
        if (bairro) {
            bairroMatch = linha.rotas.some(r => r.toLowerCase().includes(bairro));
        }
        return (nomeMatch || !termo) && bairroMatch;
    });
    res.json({ success: true, data: resultados });
});
app.post('/api/avaliacoes/salvar', async (req, res) => {
    const { id, latitude, longitude, avaliacao, comentario, anonimo } = req.body;
    try {
        await pool.query(
            `INSERT INTO avaliacoes_paradas (coordenadas_id, latitude, longitude, avaliacao, comentario, anonimo)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (coordenadas_id) DO UPDATE SET
             avaliacao = EXCLUDED.avaliacao,
             comentario = EXCLUDED.comentario,
             anonimo = EXCLUDED.anonimo,
             data_criacao = CURRENT_TIMESTAMP`,
            [id, latitude, longitude, avaliacao, comentario, anonimo]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar avaliação' });
    }
});
app.post('/api/avaliacoes', async (req, res) => {
    const { coordId } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM avaliacoes_paradas WHERE coordenadas_id = $1',
            [coordId]
        );
        res.json(result.rows.length > 0 ? result.rows[0] : null);
    } catch (error) {
        console.error('Erro ao buscar avaliação:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar avaliação' });
    }
});
app.post('/api/avaliacoes/remover', async (req, res) => {
    const { coordId } = req.body;
    try {
        await pool.query('DELETE FROM avaliacoes_paradas WHERE coordenadas_id = $1', [coordId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover avaliação:', error);
        res.status(500).json({ success: false, error: 'Erro ao remover avaliação' });
    }
});
app.post('/api/avaliacoes/proximas', async (req, res) => {
    const { latitude, longitude, raio = 0.3 } = req.body;
    try {
        const result = await pool.query(
            `SELECT *, 
             SQRT(POW(69.1 * (latitude - $1), 2) + 
                  POW(69.1 * ($2 - longitude) * COS(latitude / 57.3), 2)) AS distance
             FROM avaliacoes_paradas
             WHERE SQRT(POW(69.1 * (latitude - $1), 2) + 
                       POW(69.1 * ($2 - longitude) * COS(latitude / 57.3), 2)) <= $3
             ORDER BY distance
             LIMIT 5`,
            [latitude, longitude, raio]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Erro ao buscar avaliações próximas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar avaliações próximas' });
    }
});

app.get('/pesquisa.html', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pesquisa.html'));
});

app.get('/pesquisa.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pesquisa.js'));
});

app.get('/pesquisa.css', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pesquisa.css'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.js'));
});

app.get('/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.css'));
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


app.post('/api/auth/google', async (req, res) => {
  const { id_token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: '1006485668370-pbnmae0bkslevk20pkjmh4mgg7o1trj2.apps.googleusercontent.com'
    });
    
    const payload = ticket.getPayload();
    
    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    
    const token = jwt.sign(
      { userId: user.googleId, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    
    res.json({ 
      success: true, 
      redirect_uri: `http://localhost:3000/api/auth/google/callback?token=${encodeURIComponent(token)}`,
      user,
      token
    });
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Falha na autenticação' 
    });
  }
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


app.get('/api/protegida', authenticateToken, (req, res) => {
  res.json({ message: 'Rota protegida acessada com sucesso!' });
});


app.get('/api/auth/google/callback', (req, res) => {
  
  const token = req.query.token;
  
  if (!token) {
    return res.status(400).send('Token não encontrado');
  }

  res.redirect(`/pesquisa.html?token=${encodeURIComponent(token)}`);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, data_criacao) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, nome, email`,
      [name, email, hashedPassword]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
  console.error('Erro no registro:', error.message);
  console.error(error.stack);
  res.status(500).json({
    success: false,
    error: error.message
  });
}

  

});


app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];

    
    const passwordMatch = await bcrypt.compare(password, user.senha);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.nome,
        email: user.email
      }
    });
  } catch (error) {
  console.error('Erro no login:', error.message);
  console.error(error.stack);
  res.status(500).json({
    success: false,
    error: error.message
  });
}

  

});
