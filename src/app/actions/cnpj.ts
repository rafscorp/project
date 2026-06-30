"use server";

interface CNPJResponse {
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  descricao_situacao_cadastral: string;
}

export async function fetchCnpjData(cnpj: string) {
  try {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    if (cleanCnpj.length !== 14) {
      return { success: false, error: "CNPJ inválido (deve conter 14 dígitos)." };
    }

    // Usando BrasilAPI (100% Gratuita, Sem Limites, Super Estável)
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
      method: "GET",
      // Adiciona um timeout curto para não travar a UI se a API demorar
      signal: AbortSignal.timeout(5000), 
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "CNPJ não encontrado na Receita Federal." };
      }
      throw new Error(`Erro na BrasilAPI: ${response.status}`);
    }

    const data: CNPJResponse = await response.json();

    if (data.descricao_situacao_cadastral !== "ATIVA") {
      return { 
        success: false, 
        error: `Atenção: A situação deste CNPJ é ${data.descricao_situacao_cadastral}. Lojas devem estar ativas.` 
      };
    }

    return { 
      success: true, 
      data: {
        legalName: data.razao_social,
        name: data.nome_fantasia || data.razao_social, // Se não tiver nome fantasia, usa a Razão Social
        address: `${data.logradouro}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ''}`,
        city: data.municipio,
        state: data.uf,
        zipCode: data.cep,
      } 
    };
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error);
    return { success: false, error: "Serviço de consulta indisponível no momento." };
  }
}
