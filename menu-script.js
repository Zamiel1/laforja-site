document.addEventListener('DOMContentLoaded', () => {
  // Get current logged-in user
  const currentUser = localStorage.getItem('currentUser');
  
  // If no user is logged in, redirect to login
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  const userEmail = currentUser;
  document.getElementById('user-email').textContent = userEmail;

  // Modal functionality
  const composeModal = document.getElementById('compose-modal');
  const settingsModal = document.getElementById('settings-modal');
  const composeBtn = document.querySelector('.compose-btn');
  const settingsItem = document.querySelector('[data-action="settings"]');
  const helpItem = document.querySelector('[data-action="help"]');

  function closeAllModals() {
    composeModal.classList.remove('active');
    settingsModal.classList.remove('active');
  }

  function openModal(modal) {
    closeAllModals();
    modal.classList.add('active');
  }

  composeBtn.addEventListener('click', () => openModal(composeModal));
  settingsItem.addEventListener('click', () => openModal(settingsModal));

  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Close modal on outside click
  [composeModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Compose form
  const composeForm = document.getElementById('compose-form');
  composeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const to = document.getElementById('compose-to').value.trim();
    const subject = document.getElementById('compose-subject').value.trim();
    const message = document.getElementById('compose-message').value.trim();

    if (!to || !subject || !message) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Save email to localStorage
    const emailData = {
      id: Date.now(),
      from: userEmail,
      to: to,
      subject: subject,
      message: message,
      date: new Date().toLocaleString('es-ES'),
      read: false,
      starred: false,
      folder: 'sent'
    };

    let emails = JSON.parse(localStorage.getItem('emails') || '[]');
    emails.push(emailData);
    localStorage.setItem('emails', JSON.stringify(emails));

    alert('Correo enviado correctamente');
    composeForm.reset();
    closeAllModals();
    loadEmails('inbox');
  });

  // Menu items
  const menuItems = document.querySelectorAll('[data-folder]');
  let currentFolder = 'inbox';

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentFolder = item.dataset.folder;
      loadEmails(currentFolder);
    });
  });

  // Load emails
  function loadEmails(folder) {
    const emailList = document.getElementById('email-list');
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    // If viewing 'sent', show only emails sent by the logged in user
    const filteredEmails = emails.filter(e => {
      if (folder === 'sent') return e.folder === 'sent' && e.from === userEmail;
      return e.folder === folder;
    });

    if (filteredEmails.length === 0) {
      emailList.innerHTML = `
        <div class="empty-state">
          <p class="empty-icon">📭</p>
          <p>No hay correos en esta carpeta</p>
        </div>
      `;
      return;
    }

    emailList.innerHTML = filteredEmails
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(email => `
        <div class="email-item" onclick="openEmail(${email.id})">
          <input type="checkbox" class="email-checkbox" onclick="event.stopPropagation()" />
          <div class="email-avatar">${(email.from || 'U').charAt(0).toUpperCase()}</div>
          <div class="email-content">
            <div class="email-header">
              <span class="email-from">${email.from}</span>
              <span class="email-date">${formatDate(email.date)}</span>
            </div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${email.message.substring(0, 60)}...</div>
          </div>
          <div class="email-star" onclick="event.stopPropagation(); toggleStar(${email.id})">
            ${email.starred ? '⭐' : '☆'}
          </div>
        </div>
      `).join('');

    updateCounts();
  }

  // Format date
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
  }

  // Toggle star
  window.toggleStar = function(emailId) {
    let emails = JSON.parse(localStorage.getItem('emails') || '[]');
    emails = emails.map(e => {
      if (e.id === emailId) {
        e.starred = !e.starred;
      }
      return e;
    });
    localStorage.setItem('emails', JSON.stringify(emails));
    loadEmails(currentFolder);
  };

  // Open email (expanded view)
  window.openEmail = function(emailId) {
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    const email = emails.find(e => e.id === emailId);
    if (email) {
      email.read = true;
      localStorage.setItem('emails', JSON.stringify(emails));
      alert(`De: ${email.from}\nAsunto: ${email.subject}\n\n${email.message}`);
      loadEmails(currentFolder);
    }
  };

  // Update counts
  function updateCounts() {
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    const folders = ['inbox', 'drafts', 'sent', 'starred', 'spam', 'trash'];
    folders.forEach(folder => {
      let count;
      if (folder === 'sent') {
        count = emails.filter(e => e.folder === 'sent' && e.from === userEmail).length;
      } else {
        count = emails.filter(e => e.folder === folder).length;
      }
      const countEl = document.getElementById(`count-${folder}`);
      if (countEl) {
        countEl.textContent = count;
      }
    });
  }

  // Search
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.querySelector('.search-btn');

  function search() {
    const query = searchInput.value.toLowerCase();
    const emails = JSON.parse(localStorage.getItem('emails') || '[]');
    const emailList = document.getElementById('email-list');

    const results = emails.filter(e =>
      (e.subject.toLowerCase().includes(query) ||
       e.message.toLowerCase().includes(query) ||
       e.from.toLowerCase().includes(query)) &&
      (currentFolder === 'sent' ? (e.folder === 'sent' && e.from === userEmail) : e.folder === currentFolder)
    );

    if (results.length === 0) {
      emailList.innerHTML = `
        <div class="empty-state">
          <p class="empty-icon">🔍</p>
          <p>No se encontraron resultados</p>
        </div>
      `;
      return;
    }

    emailList.innerHTML = results
      .map(email => `
        <div class="email-item" onclick="openEmail(${email.id})">
          <input type="checkbox" class="email-checkbox" onclick="event.stopPropagation()" />
          <div class="email-avatar">${(email.from || 'U').charAt(0).toUpperCase()}</div>
          <div class="email-content">
            <div class="email-header">
              <span class="email-from">${email.from}</span>
              <span class="email-date">${formatDate(email.date)}</span>
            </div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${email.message.substring(0, 60)}...</div>
          </div>
          <div class="email-star" onclick="event.stopPropagation(); toggleStar(${email.id})">
            ${email.starred ? '⭐' : '☆'}
          </div>
        </div>
      `).join('');
  }

  searchBtn.addEventListener('click', search);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      search();
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    }
  });

  // Change password
  document.querySelector('.change-password-btn').addEventListener('click', () => {
    const newPassword = document.getElementById('new-password').value.trim();
    if (!newPassword) {
      alert('Ingresa una contraseña');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[userEmail] = { ...users[userEmail], password: newPassword };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Contraseña actualizada correctamente');
    document.getElementById('new-password').value = '';
  });

  // Initialize
  loadEmails('inbox');

  // Refresh when emails are updated elsewhere
  window.addEventListener('emailsUpdated', () => {
    loadEmails(currentFolder);
    updateCounts();
  });

  // Add some demo emails
  if (JSON.parse(localStorage.getItem('emails') || '[]').length === 0) {
    const demoEmails = [
      {
        id: 1,
        from: 'soporte@forja.com.mx',
        to: userEmail,
        subject: 'Bienvenido a La Forja',
        message: 'Bienvenido al sistema de correo de La Forja. Disfruta de todas nuestras funcionalidades.',
        date: new Date().toLocaleString('es-ES'),
        read: false,
        starred: false,
        folder: 'inbox'
      },
      {
        id: 2,
        from: 'noticias@forja.com.mx',
        to: userEmail,
        subject: 'Nuevo boletín semanal',
        message: 'Consulta nuestro último boletín con las noticias más importantes de la semana.',
        date: new Date(Date.now() - 86400000).toLocaleString('es-ES'),
        read: false,
        starred: false,
        folder: 'inbox'
      }
    ];
    localStorage.setItem('emails', JSON.stringify(demoEmails));
    loadEmails('inbox');
  }
});
