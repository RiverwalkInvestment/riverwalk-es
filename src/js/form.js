export function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        btn.disabled = false;
        btn.textContent = 'Iniciar conversación';
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Iniciar conversación';
    }
  });
}
