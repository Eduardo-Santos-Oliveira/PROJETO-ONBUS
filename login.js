document.addEventListener('DOMContentLoaded', function() {
  // Verifica se já está logado
 verificarLoginValido();

async function verificarLoginValido() {
  const userData = localStorage.getItem('user');

  if (!userData) return;

  try {
    const user = JSON.parse(userData);
    if (!user.token) return;

    // Verifica no servidor se o token ainda é válido
    const response = await fetch('/api/protegida', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    if (response.ok) {
      window.location.href = 'pesquisa.html';
    } else {
      localStorage.removeItem('user');
    }
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    localStorage.removeItem('user');
  }
}


  // Elementos do DOM
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  // Mostrar formulário de cadastro
  showRegister.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  });

  // Mostrar formulário de login
  showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Manipulador de login
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleLogin();
  });

  // Manipulador de cadastro
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    handleRegister();
  });
});

async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const loginContent = document.querySelector('.login-content');
  
  // Mostrar loading
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Autenticando...</span>';
  loginContent.appendChild(loading);

  try {
    const response = await fetch('api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na autenticação');
    }

    // Salva os dados do usuário e redireciona
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      picture: data.user.picture,
      token: data.token
    }));
    
    window.location.href = 'pesquisa.html';
  } catch (error) {
    showError(error.message);
  } finally {
    loading.remove();
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  
  // Validação básica
  if (password !== confirmPassword) {
    showError('As senhas não coincidem');
    return;
  }

  const loginContent = document.querySelector('.login-content');
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Criando conta...</span>';
  loginContent.appendChild(loading);

  try {
    const response = await fetch('api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro no cadastro');
    }

    // Mostra mensagem de sucesso e volta para o login
    showSuccess('Conta criada com sucesso! Faça login.');
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    // Limpa os campos
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
  } catch (error) {
    showError(error.message);
  } finally {
    loading.remove();
  }
}

function showError(message) {
  const loginContent = document.querySelector('.login-content');
  
  // Remove mensagens anteriores
  const oldError = loginContent.querySelector('.error-message');
  if (oldError) oldError.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
  loginContent.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccess(message) {
  const loginContent = document.querySelector('.login-content');
  
  // Remove mensagens anteriores
  const oldSuccess = loginContent.querySelector('.success-message');
  if (oldSuccess) oldSuccess.remove();
  
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
  loginContent.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}