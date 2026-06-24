import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardBody } from "@/components/ui/Card";
import { RegisterCustomerForm } from "@/components/auth/RegisterCustomerForm";

export default function RegisterCustomerPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <Navbar />
      <div className="flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardBody>
            <h1 className="font-display text-2xl font-bold text-white">Criar conta de cliente</h1>
            <p className="mt-1 text-sm text-zinc-400">Compre nas lojas parceiras e acompanhe seus pedidos</p>
            <div className="mt-6">
              <RegisterCustomerForm />
            </div>
          </CardBody>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
