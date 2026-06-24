document.addEventListener('DOMContentLoaded', () => {
  const session = AguryUI.requireAuth('customer');
  if (!session) return;

  const user = session.user;
  document.getElementById('welcome-msg').textContent = `Olá, ${user.name}! Acompanhe suas solicitações e propostas.`;

  const quotes = AguryDB.getQuotesByCustomer(user.email);
  const container = document.getElementById('quotes-list');

  if (quotes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>Nenhum orçamento ainda</h3>
        <p style="margin:1rem 0 2rem;">Solicite seu primeiro orçamento e receba propostas das oficinas parceiras.</p>
        <a href="../orcamento.html" class="btn btn-primary">Solicitar Orçamento</a>
      </div>
    `;
    return;
  }

  quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = quotes.map(q => {
    const statusClass = q.status === 'answered' ? 'badge-answered' : 'badge-pending';
    const statusLabel = q.status === 'answered' ? 'Com propostas' : 'Aguardando';
    const types = (q.serviceTypes?.length ? q.serviceTypes : [q.serviceType])
      .map(t => `<span class="service-tag">${AguryUI.serviceLabel(t)}</span>`).join('');

    const responses = q.responses.length ? `
      <div class="responses-list">
        <strong style="font-size:0.85rem;color:var(--text-muted);">Propostas recebidas (${q.responses.length})</strong>
        ${q.responses.map(r => `
          <div class="response-item">
            <header>
              <strong>${r.storeName}</strong>
              <span class="response-price">${AguryUI.formatMoney(r.price)}</span>
            </header>
            ${r.deadline ? `<p style="font-size:0.85rem;color:var(--text-muted);">Prazo: ${r.deadline}</p>` : ''}
            ${r.message ? `<p style="font-size:0.9rem;margin-top:0.5rem;">${r.message}</p>` : ''}
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">${AguryUI.formatDate(r.createdAt)}</p>
          </div>
        `).join('')}
      </div>
    ` : `<p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.5rem;">Aguardando propostas das oficinas...</p>`;

    return `
      <article class="quote-card">
        <div class="quote-header">
          <div>
            <span class="quote-id">#${q.id.toUpperCase()}</span>
            <h3 style="margin-top:0.25rem;">${q.vehicleBrand} ${q.vehicleModel} ${q.vehicleYear}</h3>
            <div class="service-tags">${types}</div>
          </div>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="quote-meta">
          <div class="quote-meta-item"><label>Solicitado em</label><span>${AguryUI.formatDate(q.createdAt)}</span></div>
          <div class="quote-meta-item"><label>Propostas</label><span>${q.responses.length}</span></div>
        </div>
        <p style="font-size:0.9rem;color:var(--text-muted);">${q.description}</p>
        ${responses}
      </article>
    `;
  }).join('');
});
