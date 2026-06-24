/**
 * Agury Auto — Utilitários globais da UI
 */
const AguryUI = (() => {
  const BRANDS = [
    'Volkswagen', 'Chevrolet', 'Fiat', 'Ford', 'Peugeot', 'Renault', 'Honda',
    'Toyota', 'Hyundai', 'Jeep', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi',
    'Citroën', 'Mitsubishi', 'Kia', 'Volvo', 'Chery', 'Outra',
  ];

  const SERVICE_TYPES = [
    { id: 'mecanica', label: 'Mecânica Geral' },
    { id: 'estetica', label: 'Estética Automotiva' },
    { id: 'detalhamento', label: 'Detalhamento / Polimento' },
    { id: 'funilaria', label: 'Funilaria e Pintura' },
    { id: 'revisao', label: 'Revisão Preventiva' },
    { id: 'suspensao', label: 'Suspensão e Freios' },
    { id: 'ar', label: 'Ar Condicionado' },
    { id: 'alinhamento', label: 'Alinhamento e Balanceamento' },
    { id: 'vidros', label: 'Vidros e Películas' },
    { id: 'outro', label: 'Outro Serviço' },
  ];

  const STATES = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
  ];

  function $(sel, ctx = document) {
    return ctx.querySelector(sel);
  }

  function $$(sel, ctx = document) {
    return [...ctx.querySelectorAll(sel)];
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function formatMoney(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function showAlert(container, message, type = 'success') {
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${message}</span>`;
    container.prepend(el);
    setTimeout(() => el.remove(), 6000);
  }

  function initNavbar() {
    const navbar = $('.navbar');
    const toggle = $('.menu-toggle');
    const links = $('.nav-links');

    window.addEventListener('scroll', () => {
      navbar?.classList.toggle('scrolled', window.scrollY > 20);
    });

    toggle?.addEventListener('click', () => links?.classList.toggle('open'));

    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  function initCharCounter(textarea, counterEl, max = 1000) {
    if (!textarea || !counterEl) return;
    const update = () => {
      const left = max - textarea.value.length;
      counterEl.textContent = `${left} caracteres restantes`;
    };
    textarea.addEventListener('input', update);
    update();
  }

  function populateSelect(select, options, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    options.forEach(opt => {
      const val = typeof opt === 'string' ? opt : opt.id || opt.value;
      const label = typeof opt === 'string' ? opt : opt.label || opt.name;
      select.innerHTML += `<option value="${val}">${label}</option>`;
    });
  }

  function readFilesAsBase64(input, previewEl, maxFiles = 3) {
    const files = [...input.files].slice(0, maxFiles);
    previewEl.innerHTML = '';
    return Promise.all(files.map(file => new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Cada foto deve ter no máximo 5MB.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        previewEl.appendChild(img);
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
  }

  function requireAuth(type) {
    const session = AguryDB.getSession();
    if (!session || session.type !== type) {
      location.href = 'login.html';
      return null;
    }
    return session;
  }

  function renderNavUser() {
    const session = AguryDB.getSession();
    const navActions = $('.nav-actions');
    if (!navActions || !session) return;

    const name = session.user.name || session.user.companyName;
    const dash = session.type === 'customer' ? 'dashboard/cliente.html' : 'dashboard/loja.html';

    navActions.innerHTML = `
      <a href="${dash}" class="btn btn-ghost btn-sm">Olá, ${name.split(' ')[0]}</a>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-logout">Sair</button>
    `;

    $('#btn-logout')?.addEventListener('click', () => {
      AguryDB.clearSession();
      location.href = 'index.html';
    });
  }

  function serviceLabel(id) {
    return SERVICE_TYPES.find(s => s.id === id)?.label || id;
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    renderNavUser();
  });

  return {
    $, $$, BRANDS, SERVICE_TYPES, STATES,
    formatDate, formatMoney, showAlert, initCharCounter,
    populateSelect, readFilesAsBase64, requireAuth, serviceLabel,
  };
})();
