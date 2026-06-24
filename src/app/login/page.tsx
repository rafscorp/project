import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardBody } from "@/components/ui/Card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <div className="flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardBody>
            <h1 className="font-display text-2xl font-bold text-white">Entrar</h1>
            <p className="mt-1 text-sm text-zinc-400">Acesse sua conta de empresa, admin ou cliente</p>
            <div className="mt-6">
              <LoginForm />
            </div>
            <div className="mt-6 rounded-xl bg-zinc-800/50 p-3 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-400">Contas demo (após seed):</p>
              <p>Admin: admin@agury.com.br / admin123</p>
              <p>Loja: loja@agurydemo.com.br / loja123</p>
              <p>Cliente: cliente@email.com / cliente123</p>
            </div>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
