document.addEventListener('DOMContentLoaded', () => {
  const session = AguryUI.requireAuth('store');
  if (!session) return;

  const store = session.user;
  document.getElementById('store-name').textContent = store.companyName;
  document.getElementById('store-info').textContent = `${store.city}/${store.state} · ${store.services.map(AguryUI.serviceLabel).join(', ')}`;

  const alertBox = document.getElementById('alert-box');
  const modal = document.getElementById('response-modal');

  function renderQuotes() {
    const quotes = AguryDB.getQuotesForStore(store.id);
    const pending = quotes.filter(q => !q.responses.some(r => r.storeId === store.id));
    const answered = quotes.filter(q => q.responses.some(r => r.storeId === store.id));

    renderList('panel-pending', pending, false);
    renderList('panel-answered', answered, true);
  }

  function renderList(panelId, quotes, answered) {
    const panel = document.getElementById(panelId);
    if (quotes.length === 0) {
      panel.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${answered ? '✓' : '📥'}</div>
          <h3>${answered ? 'Nenhuma proposta enviada' : 'Nenhuma solicitação no momento'}</h3>
          <p>${answered ? 'Suas propostas enviadas aparecerão aqui.' : 'Novas solicitações de clientes aparecerão aqui automaticamente.'}</p>
        </div>
      `;
      return;
    }

    quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    panel.innerHTML = quotes.map(q => {
      const types = (q.serviceTypes?.length ? q.serviceTypes : [q.serviceType])
        .map(t => `<span class="service-tag">${AguryUI.serviceLabel(t)}</span>`).join('');
      const myResponse = q.responses.find(r => r.storeId === store.id);

      return `
        <article class="quote-card">
          <div class="quote-header">
            <div>
              <span class="quote-id">#${q.id.toUpperCase()}</span>
              <h3 style="margin-top:0.25rem;">${q.vehicleBrand} ${q.vehicleModel} ${q.vehicleYear}</h3>
              <div class="service-tags">${types}</div>
            </div>
            ${myResponse ? `<span class="badge badge-answered">Enviada</span>` : `<span class="badge badge-pending">Nova</span>`}
          </div>
          <div class="quote-meta">
            <div class="quote-meta-item"><label>Cliente</label><span>${q.customerName}</span></div>
            <div class="quote-meta-item"><label>Contato</label><span>${q.customerPhone}</span></div>
            <div class="quote-meta-item"><label>Cidade</label><span>${q.customerCity || '—'}${q.customerState ? '/' + q.customerState : ''}</span></div>
            <div class="quote-meta-item"><label>Data</label><span>${AguryUI.formatDate(q.createdAt)}</span></div>
          </div>
          <p style="font-size:0.9rem;color:var(--text-muted);margin:0.75rem 0;">${q.description}</p>
          ${myResponse ? `
            <div class="response-item">
              <header>
                <strong>Sua proposta</strong>
                <span class="response-price">${AguryUI.formatMoney(myResponse.price)}</span>
              </header>
              ${myResponse.deadline ? `<p style="font-size:0.85rem;color:var(--text-muted);">Prazo: ${myResponse.deadline}</p>` : ''}
              ${myResponse.message ? `<p style="font-size:0.9rem;">${myResponse.message}</p>` : ''}
            </div>
          ` : `<button class="btn btn-primary btn-sm respond-btn" data-id="${q.id}">Enviar Proposta</button>`}
        </article>
      `;
    }).join('');

    panel.querySelectorAll('.respond-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
  }

  function openModal(quoteId) {
    document.getElementById('response-quote-id').value = quoteId;
    document.getElementById('response-form').reset();
    modal.style.display = 'grid';
  }

  document.getElementById('cancel-response').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('response-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const quoteId = document.getElementById('response-quote-id').value;
    try {
      AguryDB.addResponse(quoteId, store.id, {
        price: document.getElementById('response-price').value,
        deadline: document.getElementById('response-deadline').value.trim(),
        message: document.getElementById('response-message').value.trim(),
      });
      modal.style.display = 'none';
      AguryUI.showAlert(alertBox, 'Proposta enviada com sucesso!', 'success');
      renderQuotes();
    } catch (err) {
      AguryUI.showAlert(alertBox, err.message, 'error');
    }
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });

  renderQuotes();
});
