import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { env } from "@/lib/env";

export const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: env.MERCADOPAGO_ACCESS_TOKEN || "TEST-mock-token",
});

export const mpPreference = new Preference(mercadoPagoConfig);
export const mpPayment = new Payment(mercadoPagoConfig);
