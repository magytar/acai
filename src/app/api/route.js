// app/api/mercadopago/route.js
import { NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';

export async function POST(req) {
  try {
    // Obter dados da requisição
    const requestData = await req.json();
    const { title, price, quantity = 1, description = '' } = requestData;

    // Validar dados recebidos
    if (!title || !price) {
      return NextResponse.json(
        { error: 'Título e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Configurar cliente do Mercado Pago com o token
    const client = new MercadoPagoConfig({
      accessToken: "APP_USR-4309405059901196-050612-9735a80b7192baa0bb9a68afb7377248-557494332"
    });

    // Criar instância de Preference
    const preference = new Preference(client);

    // Preparar dados para a preferência
    const preferenceData = {
      items: [
        {
          id: `item-${Date.now()}`,
          title,
          description,
          quantity: parseInt(quantity),
          unit_price: parseFloat(price),
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pending`,
      },
      // Não usar auto_return por enquanto para evitar o erro
      // auto_return: 'approved',
    };

    console.log('Criando preferência com:', JSON.stringify(preferenceData, null, 2));

    // Criar a preferência no Mercado Pago
    const response = await preference.create({ body: preferenceData });

    // Log detalhado da resposta para debug
    console.log('=== RESPOSTA MERCADO PAGO (COMPLETA) ===');
    console.log(JSON.stringify(response, null, 2));
    console.log('=====================================');

    // Verificar estrutura exata da resposta
    console.log('Propriedades disponíveis:', Object.keys(response));
    console.log('Tem init_point?', response.hasOwnProperty('init_point'));
    console.log('Tem sandbox_init_point?', response.hasOwnProperty('sandbox_init_point'));
    
    // Verificar se temos a URL de checkout alternativa
    let checkoutUrl = null;
    
    // Verificar diferentes possibilidades de onde a URL pode estar
    if (response.init_point) {
      checkoutUrl = response.init_point;
    } else if (response.sandbox_init_point) {
      checkoutUrl = response.sandbox_init_point;
    } else if (response.response && response.response.init_point) {
      checkoutUrl = response.response.init_point;
    } else if (response.body && response.body.init_point) {
      checkoutUrl = response.body.init_point;
    } else if (response.data && response.data.init_point) {
      checkoutUrl = response.data.init_point;
    }

    // Se não encontramos URL de checkout, retornar erro detalhado
    if (!checkoutUrl) {
      console.error('URL de checkout não encontrada na resposta:', response);
      return NextResponse.json({
        success: false,
        error: 'URL de checkout não disponível',
        response_structure: Object.keys(response),
        raw_response: response
      }, { status: 500 });
    }

    // Retornar URLs de checkout
    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      preference_id: response.id || (response.response && response.response.id)
    });
  } catch (error) {
    console.error('Erro na integração com Mercado Pago:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao processar pagamento',
      message: error.message,
      details: error.cause || 'Sem detalhes adicionais'
    }, {
      status: 500
    });
  }
}