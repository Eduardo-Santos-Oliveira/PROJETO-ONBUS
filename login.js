function handleGoogleSignIn(response) {
  const id_token = response.credential;
  const loginContent = document.querySelector('.login-content');
  const oldButton = document.querySelector('.g_id_signin');
  oldButton.style.display = 'none';
  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.innerHTML = `
    <i class="fas fa-spinner fa-spin"></i> 
    <span>Autenticando...</span>
  `;
  loginContent.appendChild(loading);
  fetch('api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      id_token,
      redirect_uri: window.location.origin
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      localStorage.setItem('user', JSON.stringify({
        id: data.user.googleId,
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture,
        token: data.token
      }));
      window.location.href = 'pesquisa.html';
    } else {
      throw new Error(data.error || 'Erro no login');
    }
  })
  .catch(error => {
    console.error('Erro no login:', error);
    loading.remove();
    oldButton.style.display = 'block';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${error.message || 'Erro ao fazer login'}</span>
    `;
    loginContent.appendChild(errorDiv);
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('user');
  if (user) {
    window.location.href = 'pesquisa.html';
  }
});