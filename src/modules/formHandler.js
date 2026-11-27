export function validPhone(value) {
  return /^[+0-9() .-]{7,25}$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''));
}

export function setupForm(form) {
  const phone = form.elements.phone;
  const name = form.elements.name;
  const date = form.elements.event_date;
  const key = form.elements.access_key;
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector('.button-label');
  const success = document.querySelector('#form-success');
  const heading = document.querySelector('.form-heading');
  const configuredKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  if (configuredKey) key.value = configuredKey;
  const today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  let submitting = false;
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  name.addEventListener('input', () => name.setCustomValidity(''));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    name.setCustomValidity(name.value.trim().length >= 2 ? '' : 'Please enter your full name.');
    phone.setCustomValidity(validPhone(phone.value) ? '' : 'Please enter a valid contact number with 7–15 digits.');
    if (!form.reportValidity()) return;
    if (!key.value || key.value === 'YOUR_ACCESS_KEY_HERE') {
      status.textContent = 'Online enquiries are not available yet. Please try again once the enquiry service has been connected.';
      return;
    }
    if (form.elements.botcheck.checked) return;
    submitting = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = 'Sending your vision…';
    status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const data = Object.fromEntries(new FormData(form));
      data.name = data.name.trim();
      data.email = data.email.trim();
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission rejected');
      form.reset(); form.hidden = true; heading.hidden = true;
      success.hidden = false; success.focus();
    } catch (error) {
      status.textContent = error.name === 'AbortError'
        ? 'The connection timed out. Your details are still here. Please try again.'
        : 'We couldn’t send your enquiry. Your details are still here. Please check your connection and try again.';
    } finally {
      clearTimeout(timeout); submitting = false; button.disabled = false;
      form.removeAttribute('aria-busy'); buttonLabel.textContent = 'Begin your celebration';
    }
  });
  document.querySelector('#new-enquiry').addEventListener('click', () => {
    success.hidden = true; form.hidden = false; heading.hidden = false;
    form.elements.name.focus();
  });
}
