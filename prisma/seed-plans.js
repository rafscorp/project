const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding plans...");

  // Desativar ou deletar planos antigos
  await prisma.subscriptionPlan.updateMany({
    data: { active: false }
  });

  const plans = [
    {
      name: "Free",
      priceMonthly: 0,
      maxProducts: 20,
      maxStaff: 1,
      maxClients: 5,
      features: [
        "Vitrine online",
        "Até 20 peças cadastradas",
        "1 usuário",
        "5 clientes por mês",
        "Suporte por email"
      ],
      active: true,
      sortOrder: 1
    },
    {
      name: "Plus",
      priceMonthly: 49.90,
      maxProducts: 100,
      maxStaff: 3,
      maxClients: 16,
      features: [
        "Vitrine em destaque",
        "Até 100 peças cadastradas",
        "Até 3 usuários",
        "16 clientes por mês",
        "Receber encomendas (orçamentos)",
        "Suporte prioritário"
      ],
      active: true,
      sortOrder: 2
    },
    {
      name: "Pro",
      priceMonthly: 129.90,
      maxProducts: 999999, // Ilimitado na prática
      maxStaff: 10,
      maxClients: 50,
      features: [
        "Tudo do plano Plus",
        "Cadastro ILIMITADO de peças",
        "Até 10 usuários",
        "50 clientes por mês",
        "Modo Deus (Análise Avançada)",
        "Selo Loja Verificada",
        "Gerente de conta exclusivo"
      ],
      active: true,
      sortOrder: 3
    }
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.name.toLowerCase() },
      update: {
        priceMonthly: plan.priceMonthly,
        maxProducts: plan.maxProducts,
        maxStaff: plan.maxStaff,
        maxClients: plan.maxClients,
        features: plan.features,
        active: true,
        sortOrder: plan.sortOrder,
        name: plan.name
      },
      create: {
        ...plan,
        slug: plan.name.toLowerCase()
      }
    });
  }

  console.log("Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
