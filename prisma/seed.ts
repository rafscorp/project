/**
 * Seed inicial — dados de demonstração para desenvolvimento
 * Execute: npm run db:seed
 */
import { PrismaClient, UserRole, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  const passwordHash = await bcrypt.hash("admin123", 12);

  // Admin da plataforma
  const admin = await prisma.user.upsert({
    where: { email: "admin@agury.com.br" },
    update: {},
    create: {
      username: "admin_agury",
      email: "admin@agury.com.br",
      passwordHash,
      name: "Administrador Agury",
      role: UserRole.PLATFORM_ADMIN,
      phone: "(11) 90000-0000",
    },
  });
  console.log("✓ Admin:", admin.email, "| senha: admin123");

  // Planos de assinatura
  const plans = [
    {
      name: "Starter",
      slug: "starter",
      description: "Ideal para oficinas pequenas começando online",
      priceMonthly: 97,
      maxProducts: 50,
      maxStaff: 2,
      features: JSON.stringify(["Loja online", "Até 50 produtos", "Painel de pedidos", "Suporte por e-mail"]),
      sortOrder: 1,
    },
    {
      name: "Professional",
      slug: "professional",
      description: "Para lojas em crescimento com mais produtos",
      priceMonthly: 197,
      maxProducts: 200,
      maxStaff: 5,
      features: JSON.stringify(["Tudo do Starter", "Até 200 produtos", "Relatórios", "Suporte prioritário"]),
      sortOrder: 2,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "Solução completa para redes e grandes operações",
      priceMonthly: 397,
      maxProducts: 9999,
      maxStaff: 20,
      features: JSON.stringify(["Produtos ilimitados", "Multi-usuários", "API", "Gerente dedicado"]),
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log("✓ Plano:", plan.name, `- R$ ${plan.priceMonthly}/mês`);
  }

  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: "professional" } });

  // Dono de loja demo
  const storeOwnerHash = await bcrypt.hash("loja123", 12);
  const storeOwner = await prisma.user.upsert({
    where: { email: "loja@agurydemo.com.br" },
    update: {},
    create: {
      username: "loja_demo",
      email: "loja@agurydemo.com.br",
      passwordHash: storeOwnerHash,
      name: "Carlos Mecânica",
      role: UserRole.STORE_OWNER,
      phone: "(11) 98888-7777",
    },
  });
  console.log("✓ Lojista:", storeOwner.email, "| senha: loja123");

  // Loja demo
  const store = await prisma.store.upsert({
    where: { slug: "diamond-car" },
    update: {},
    create: {
      slug: "diamond-car",
      name: "Diamond Car Estética & Mecânica",
      legalName: "Diamond Car Serviços Automotivos LTDA",
      cnpj: "12.345.678/0001-90",
      description: "Especialistas em estética automotiva, mecânica geral e peças. Retire seu pedido na loja!",
      phone: "(11) 3456-7890",
      email: "contato@diamondcar.com.br",
      address: "Av. Automotiva, 1500 — Jardim das Peças",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      ownerId: storeOwner.id,
    },
  });
  console.log("✓ Loja:", store.name, `→ /loja/${store.slug}`);

  if (proPlan) {
    await prisma.subscription.upsert({
      where: { storeId: store.id },
      update: {},
      create: {
        storeId: store.id,
        planId: proPlan.id,
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("✓ Assinatura Professional ativa");
  }

  // Categorias
  const categories = [
    { name: "Peças", slug: "pecas" },
    { name: "Estética", slug: "estetica" },
    { name: "Acessórios", slug: "acessorios" },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: {},
      create: { storeId: store.id, ...cat },
    });
    catMap[cat.slug] = created.id;
  }
  console.log("✓ Categorias criadas");

  // Produtos demo
  const products = [
    { name: "Kit Polimento Profissional", slug: "kit-polimento", categoryId: catMap.estetica, price: 189.9, stock: 25, featured: true, description: "Kit completo para polimento automotivo com cera premium." },
    { name: "Óleo Motor 5W30 Sintético 1L", slug: "oleo-5w30", categoryId: catMap.pecas, price: 45.9, stock: 100, sku: "OLE-5W30-1L" },
    { name: "Filtro de Ar Universal", slug: "filtro-ar", categoryId: catMap.pecas, price: 32.5, stock: 80, sku: "FLT-AR-UNI" },
    { name: "Vitrificação de Pintura", slug: "vitrificacao", categoryId: catMap.estetica, price: 299.0, stock: 15, featured: true, description: "Serviço de vitrificação — agende retirada após compra." },
    { name: "Tapete Automotivo Premium", slug: "tapete-premium", categoryId: catMap.acessorios, price: 89.9, stock: 40 },
    { name: "Pastilha de Freio Dianteira", slug: "pastilha-freio", categoryId: catMap.pecas, price: 120.0, stock: 30, comparePrice: 149.9 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {},
      create: { storeId: store.id, ...p },
    });
  }
  console.log("✓", products.length, "produtos demo");

  // Cliente demo
  const customerHash = await bcrypt.hash("cliente123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "cliente@email.com" },
    update: {},
    create: {
      username: "cliente_demo",
      email: "cliente@email.com",
      passwordHash: customerHash,
      name: "João Silva",
      role: UserRole.CUSTOMER,
      phone: "(11) 97777-6666",
    },
  });
  console.log("✓ Cliente:", customer.email, "| senha: cliente123");

  console.log("\n✅ Seed concluído!\n");

  // CRIANDO MAIS LOJAS DEMO PARA TESTE DO CARROSSEL
  const store2 = await prisma.store.upsert({
    where: { slug: "motor-power" },
    update: {},
    create: {
      slug: "motor-power",
      name: "Motor Power Auto Peças",
      legalName: "Motor Power Auto Peças LTDA",
      cnpj: "22.333.444/0001-99",
      description: "A maior variedade de peças para o seu motor. Entrega rápida!",
      phone: "(19) 3333-4444",
      email: "contato@motorpower.com",
      address: "Av. Brasil, 500",
      city: "Campinas",
      state: "SP",
      zipCode: "13000-000",
      ownerId: storeOwner.id,
      averageRating: 4.8,
      totalReviews: 85
    },
  });

  const store3 = await prisma.store.upsert({
    where: { slug: "turbo-garage" },
    update: {},
    create: {
      slug: "turbo-garage",
      name: "Turbo Custom Garage",
      legalName: "Turbo Custom Garage Automotivo",
      cnpj: "55.666.777/0001-88",
      description: "Especializada em performance, remap e preparação de motores.",
      phone: "(31) 4444-5555",
      email: "oficina@turbogarage.com.br",
      address: "Rua das Turbinas, 100",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30000-000",
      ownerId: storeOwner.id,
      averageRating: 4.9,
      totalReviews: 120
    },
  });

  // Criar reviews para as novas lojas (para aparecer no carrossel)
  await prisma.storeReview.upsert({
    where: { storeId_userId: { storeId: store2.id, userId: customer.id } },
    update: {},
    create: {
      storeId: store2.id,
      userId: customer.id,
      rating: 5,
      comment: "Comprei peças para o motor e chegou super rápido. Atendimento excelente, loja muito confiável!",
    }
  });

  await prisma.storeReview.upsert({
    where: { storeId_userId: { storeId: store3.id, userId: customer.id } },
    update: {},
    create: {
      storeId: store3.id,
      userId: customer.id,
      rating: 5,
      comment: "O remap ficou animal! O carro tá voando, recomendo de olhos fechados pra quem curte performance.",
    }
  });
  
  await prisma.storeReview.upsert({
    where: { storeId_userId: { storeId: store.id, userId: customer.id } },
    update: {},
    create: {
      storeId: store.id,
      userId: customer.id,
      rating: 5,
      comment: "Oficina impecável! Melhor polimento que já vi em São Paulo.",
    }
  });

  // Atualizar a loja principal para ter a rating computada
  await prisma.store.update({
    where: { id: store.id },
    data: { averageRating: 5.0, totalReviews: 1 }
  });

  console.log("Contas de teste:");
  console.log("  Admin:    admin@agury.com.br / admin123");
  console.log("  Lojista:  loja@agurydemo.com.br / loja123");
  console.log("  Cliente:  cliente@email.com / cliente123");
  console.log("  Loja demo: http://localhost:3000/loja/diamond-car\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
