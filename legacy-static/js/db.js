/**
 * Agury Auto — Camada de dados (localStorage)
 * Pronto para migrar para API/backend no futuro
 */
const AguryDB = (() => {
  const KEYS = {
    customers: 'agury_customers',
    stores: 'agury_stores',
    quotes: 'agury_quotes',
    session: 'agury_session',
  };

  function read(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return key === KEYS.session ? null : [];
    try {
      const parsed = JSON.parse(raw);
      if (key === KEYS.session) return parsed;
      return parsed || [];
    } catch {
      return key === KEYS.session ? null : [];
    }
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  /* Seed demo store on first load */
  function init() {
    const stores = read(KEYS.stores);
    if (stores.length === 0) {
      write(KEYS.stores, [{
        id: 'store_demo',
        companyName: 'Agury Estética & Mecânica',
        cnpj: '00.000.000/0001-00',
        owner: 'Equipe Agury',
        email: 'contato@aguryauto.com.br',
        phone: '(11) 99999-0000',
        address: 'Av. Automotiva, 1000',
        city: 'São Paulo',
        state: 'SP',
        services: ['mecanica', 'estetica', 'detalhamento', 'revisao'],
        passwordHash: hashPassword('demo123'),
        approved: true,
        createdAt: new Date().toISOString(),
      }]);
    }
  }

  /* Customers */
  function registerCustomer(data) {
    const customers = read(KEYS.customers);
    if (customers.some(c => c.email === data.email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const customer = {
      id: uid(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city || '',
      state: data.state || '',
      passwordHash: hashPassword(data.password),
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
    write(KEYS.customers, customers);
    return customer;
  }

  function findCustomer(email, password) {
    const customers = read(KEYS.customers);
    const hash = hashPassword(password);
    return customers.find(c => c.email === email && c.passwordHash === hash) || null;
  }

  /* Stores */
  function registerStore(data) {
    const stores = read(KEYS.stores);
    if (stores.some(s => s.email === data.email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const store = {
      id: uid(),
      companyName: data.companyName,
      cnpj: data.cnpj,
      owner: data.owner,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      city: data.city,
      state: data.state,
      services: data.services || [],
      passwordHash: hashPassword(data.password),
      approved: true,
      createdAt: new Date().toISOString(),
    };
    stores.push(store);
    write(KEYS.stores, stores);
    return store;
  }

  function findStore(email, password) {
    const stores = read(KEYS.stores);
    const hash = hashPassword(password);
    return stores.find(s => s.email === email && s.passwordHash === hash) || null;
  }

  function getStores() {
    return read(KEYS.stores).filter(s => s.approved);
  }

  /* Quotes */
  function createQuote(data) {
    const quotes = read(KEYS.quotes);
    const quote = {
      id: uid(),
      customerId: data.customerId || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerCity: data.customerCity || '',
      customerState: data.customerState || '',
      vehicleBrand: data.vehicleBrand,
      vehicleModel: data.vehicleModel,
      vehicleYear: data.vehicleYear,
      serviceType: data.serviceType,
      serviceTypes: data.serviceTypes || [],
      description: data.description,
      photos: data.photos || [],
      status: 'pending',
      responses: [],
      createdAt: new Date().toISOString(),
    };
    quotes.push(quote);
    write(KEYS.quotes, quotes);
    return quote;
  }

  function getQuotesByCustomer(email) {
    return read(KEYS.quotes).filter(q => q.customerEmail === email);
  }

  function getQuotesForStore(storeId) {
    const store = read(KEYS.stores).find(s => s.id === storeId);
    if (!store) return [];
    const quotes = read(KEYS.quotes);
    return quotes.filter(q => {
      if (q.status === 'closed') return false;
      if (q.responses.some(r => r.storeId === storeId)) return true;
      if (store.services.length === 0) return true;
      const types = q.serviceTypes.length ? q.serviceTypes : [q.serviceType];
      return types.some(t => store.services.includes(t));
    });
  }

  function addResponse(quoteId, storeId, data) {
    const quotes = read(KEYS.quotes);
    const idx = quotes.findIndex(q => q.id === quoteId);
    if (idx === -1) throw new Error('Orçamento não encontrado.');

    const store = read(KEYS.stores).find(s => s.id === storeId);
    if (quotes[idx].responses.some(r => r.storeId === storeId)) {
      throw new Error('Você já respondeu este orçamento.');
    }

    quotes[idx].responses.push({
      id: uid(),
      storeId,
      storeName: store?.companyName || 'Loja',
      price: parseFloat(data.price),
      deadline: data.deadline || '',
      message: data.message || '',
      createdAt: new Date().toISOString(),
    });

    if (quotes[idx].responses.length > 0) {
      quotes[idx].status = 'answered';
    }

    write(KEYS.quotes, quotes);
    return quotes[idx];
  }

  function getQuote(id) {
    return read(KEYS.quotes).find(q => q.id === id);
  }

  /* Session */
  function setSession(user, type) {
    write(KEYS.session, { user, type, at: Date.now() });
  }

  function getSession() {
    return read(KEYS.session);
  }

  function clearSession() {
    localStorage.removeItem(KEYS.session);
  }

  init();

  return {
    registerCustomer,
    findCustomer,
    registerStore,
    findStore,
    getStores,
    createQuote,
    getQuotesByCustomer,
    getQuotesForStore,
    addResponse,
    getQuote,
    setSession,
    getSession,
    clearSession,
    hashPassword,
  };
})();
