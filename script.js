document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const loginError = document.getElementById('login-error');

  const registerForm = document.getElementById('register-form');
  const regName = document.getElementById('name');
  const regUsername = document.getElementById('reg-username');
  const regPassword = document.getElementById('reg-password');
  const regPassword2 = document.getElementById('reg-password2');
  const regNameError = document.getElementById('name-error');
  const regUsernameError = document.getElementById('reg-username-error');
  const regPasswordError = document.getElementById('reg-password-error');
  const regPassword2Error = document.getElementById('reg-password2-error');
  const registerError = document.getElementById('register-error');
  const DOMAIN = '@forja.com.mx';

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem('users');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  function userExists(email) {
    const users = getUsers();
    return !!users[email.toLowerCase()];
  }

  function registerUser({ name, email, password }) {
    const users = getUsers();
    users[email.toLowerCase()] = { name: name || '', password };
    saveUsers(users);
  }

  function verifyUser(emailVal, passwordVal) {
    const users = getUsers();
    const u = users[emailVal.toLowerCase()];
    return u && u.password === passwordVal;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      emailError.textContent = '';
      passwordError.textContent = '';
      loginError.textContent = '';

      let ok = true;
      const emailVal = email.value.trim().toLowerCase();
      const passwordVal = password.value;

      if (!validateEmail(emailVal)) {
        emailError.textContent = 'Introduce un correo válido.';
        ok = false;
      }
      if (passwordVal.length < 6) {
        passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        ok = false;
      }
      if (!ok) return;

      if (verifyUser(emailVal, passwordVal)) {
        // Guardar usuario logueado
        localStorage.setItem('currentUser', emailVal);
        alert('Inicio de sesión correcto. ¡Bienvenido!');
        window.location.href = 'Menu.html';
      } else {
        loginError.textContent = 'Correo o contraseña incorrectos.';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      regNameError.textContent = '';
      regUsernameError.textContent = '';
      regPasswordError.textContent = '';
      regPassword2Error.textContent = '';
      registerError.textContent = '';

      const nameVal = regName.value.trim();
      const usernameVal = regUsername.value.trim().toLowerCase();
      const pw1 = regPassword.value;
      const pw2 = regPassword2.value;
      const fullEmail = usernameVal + DOMAIN;

      let ok = true;
      if (!nameVal) {
        regNameError.textContent = 'Introduce tu nombre.';
        ok = false;
      }
      if (!usernameVal) {
        regUsernameError.textContent = 'Introduce un usuario válido.';
        ok = false;
      } else if (!/^[a-z0-9._-]+$/.test(usernameVal)) {
        regUsernameError.textContent = 'Solo letras minúsculas, números y puntos permitidos.';
        ok = false;
      }
      if (pw1.length < 6) {
        regPasswordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        ok = false;
      } else if (!/[a-z]/i.test(pw1) || !/[0-9]/.test(pw1)) {
        regPasswordError.textContent = 'La contraseña debe contener letras y números.';
        ok = false;
      }
      if (pw1 !== pw2) {
        regPassword2Error.textContent = 'Las contraseñas no coinciden.';
        ok = false;
      }
      if (!ok) return;

      if (userExists(fullEmail)) {
        registerError.textContent = 'Ya existe una cuenta con ese usuario.';
        return;
      }

      registerUser({ name: nameVal, email: fullEmail, password: pw1 });
      alert('¡Cuenta creada correctamente!\n\nCorreo: ' + fullEmail + '\n\nAhora inicia sesión con tus credenciales.');
      window.location.href = 'index.html';
    });
  }

  const recoverForm = document.getElementById('recover-form');
  if (recoverForm) {
    const recoverEmail = document.getElementById('recover-email');
    const recoverEmailError = document.getElementById('recover-email-error');
    const recoverError = document.getElementById('recover-error');
    const recoverSuccess = document.getElementById('recover-success');
    const passwordDisplay = document.getElementById('password-display');
    const displayedPassword = document.getElementById('displayed-password');

    recoverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      recoverEmailError.textContent = '';
      recoverError.textContent = '';
      recoverSuccess.textContent = '';
      passwordDisplay.style.display = 'none';

      const usernameVal = recoverEmail.value.trim().toLowerCase();
      const fullEmail = usernameVal + DOMAIN;

      if (!usernameVal) {
        recoverEmailError.textContent = 'Introduce tu usuario.';
        return;
      }

      const users = getUsers();
      const user = users[fullEmail];

      if (!user) {
        recoverError.textContent = 'No existe una cuenta con ese correo.';
        return;
      }

      displayedPassword.textContent = user.password;
      passwordDisplay.style.display = 'block';
      recoverSuccess.textContent = '✓ Contraseña recuperada. Ahora puedes copiarla.';
      recoverForm.style.display = 'none';
    });
  }

  // Enviar aviso de rechazo al administrador (globalmente accesible)
  window.sendRejectionNotice = function({ userEmail, userName, joinWaitlist = false } = {}) {
    if (!userEmail) {
      console.warn('sendRejectionNotice: falta userEmail');
      return false;
    }
    const admin = 'zamicordero@forja.com.mx';
    const subject = `Aviso: Usuario no cumple compromiso - ${userEmail}`;
    const messageLines = [];
    messageLines.push('¡Gracias por tu sinceridad!');
    messageLines.push('');
    messageLines.push('En este momento estamos priorizando a quienes desean aportar y participar activamente.');
    messageLines.push('');
    messageLines.push('¿Te gustaría que te avisemos cuando abramos una nueva generación?');
    messageLines.push('Marca aquí para unirte a la lista de espera: ' + (joinWaitlist ? 'Sí' : 'No'));
    messageLines.push('');
    messageLines.push(`Usuario: ${userName || '-'} (${userEmail})`);

    const now = new Date().toLocaleString('es-ES');
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');

    // Email visible en la Bandeja de entrada del administrador
    const adminEmail = {
      id: Date.now(),
      from: userEmail || 'noreply@forja.com.mx',
      to: admin,
      subject,
      message: messageLines.join('\n'),
      date: now,
      read: false,
      starred: false,
      folder: 'inbox'
    };

    // Copia en Enviados (folder 'sent') para registro
    const sentCopy = {
      id: Date.now() + 1,
      from: userEmail || 'noreply@forja.com.mx',
      to: admin,
      subject,
      message: messageLines.join('\n'),
      date: now,
      read: true,
      starred: false,
      folder: 'sent'
    };

    emails.push(adminEmail, sentCopy);
    localStorage.setItem('emails', JSON.stringify(emails));

    // Optional: track a separate log of rejections
    const rejects = JSON.parse(localStorage.getItem('rejections') || '[]');
    rejects.push({ userEmail, userName, joinWaitlist, date: emailObj.date });
    localStorage.setItem('rejections', JSON.stringify(rejects));

    // If the menu is open, try to refresh counts by dispatching a custom event
    try { window.dispatchEvent(new Event('emailsUpdated')); } catch (e) {}

    return true;
  };
});
