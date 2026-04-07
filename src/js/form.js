export function initForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();

    // Basic validation
    const email = form.querySelector('#email').value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showError(form, btn, 'Por favor, introduzca un email válido.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.hidden = true;
        success.hidden = false;
      } else {
        showError(form, btn, 'Error al enviar. Inténtelo de nuevo.');
        btn.disabled = false;
        btn.textContent = 'Iniciar conversación';
      }
    } catch {
      showError(form, btn, 'Error de conexión. Inténtelo de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Iniciar conversación';
    }
  });
}

function showError(form, btn, message) {
  const error = document.createElement('p');
  error.className = 'form-error';
  error.textContent = message;
  btn.insertAdjacentElement('afterend', error);
}
