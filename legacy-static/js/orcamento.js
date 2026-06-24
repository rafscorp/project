document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quote-form');
  const alertBox = document.getElementById('alert-box');
  const brandSelect = document.getElementById('vehicleBrand');
  const serviceSelect = document.getElementById('serviceType');
  const stateSelect = document.getElementById('customerState');
  const serviceTypesEl = document.getElementById('serviceTypes');
  const description = document.getElementById('description');
  const charCount = document.getElementById('char-count');
  const photosInput = document.getElementById('photos');
  const photoPreview = document.getElementById('photo-preview');

  AguryUI.populateSelect(brandSelect, AguryUI.BRANDS, '-- Selecione a marca --');
  AguryUI.populateSelect(serviceSelect, AguryUI.SERVICE_TYPES, '-- Selecione o serviço --');
  AguryUI.populateSelect(stateSelect, AguryUI.STATES, '-- Selecione --');

  AguryUI.SERVICE_TYPES.forEach(s => {
    serviceTypesEl.innerHTML += `
      <label class="checkbox-item">
        <input type="checkbox" name="serviceTypes" value="${s.id}">
        ${s.label}
      </label>
    `;
  });

  AguryUI.initCharCounter(description, charCount);

  const session = AguryDB.getSession();
  if (session?.type === 'customer') {
    document.getElementById('customerName').value = session.user.name || '';
    document.getElementById('customerEmail').value = session.user.email || '';
    document.getElementById('customerPhone').value = session.user.phone || '';
    document.getElementById('customerCity').value = session.user.city || '';
    if (session.user.state) document.getElementById('customerState').value = session.user.state;
  }

  photosInput.addEventListener('change', async () => {
    try {
      await AguryUI.readFilesAsBase64(photosInput, photoPreview);
    } catch (e) {
      AguryUI.showAlert(alertBox, e.message, 'error');
      photosInput.value = '';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      let photos = [];
      if (photosInput.files.length) {
        photos = await AguryUI.readFilesAsBase64(photosInput, photoPreview);
      }

      const serviceTypes = [...form.querySelectorAll('input[name="serviceTypes"]:checked')].map(c => c.value);

      const quote = AguryDB.createQuote({
        customerId: session?.type === 'customer' ? session.user.id : null,
        customerName: document.getElementById('customerName').value.trim(),
        customerEmail: document.getElementById('customerEmail').value.trim().toLowerCase(),
        customerPhone: document.getElementById('customerPhone').value.trim(),
        customerCity: document.getElementById('customerCity').value.trim(),
        customerState: document.getElementById('customerState').value,
        vehicleBrand: brandSelect.value,
        vehicleModel: document.getElementById('vehicleModel').value.trim(),
        vehicleYear: document.getElementById('vehicleYear').value,
        serviceType: serviceSelect.value,
        serviceTypes,
        description: description.value.trim(),
        photos,
      });

      form.reset();
      photoPreview.innerHTML = '';
      AguryUI.initCharCounter(description, charCount);

      AguryUI.showAlert(
        alertBox,
        `Orçamento enviado com sucesso! Código: ${quote.id.toUpperCase()}. As oficinas parceiras já receberam sua solicitação.`,
        'success'
      );

      setTimeout(() => {
        if (session?.type === 'customer') {
          location.href = 'dashboard/cliente.html';
        } else {
          location.href = 'cadastro/cliente.html?from=quote';
        }
      }, 2500);
    } catch (err) {
      AguryUI.showAlert(alertBox, err.message || 'Erro ao enviar. Tente novamente.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar Solicitação de Orçamento';
    }
  });
});
