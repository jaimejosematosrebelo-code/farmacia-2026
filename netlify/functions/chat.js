const { Groq } = require('groq-sdk');

exports.handler = async function(event, context) {
  // Garante que a requisição seja POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    const { pergunta, systemPrompt } = JSON.parse(event.body);

    // Pega a chave da API diretamente das variáveis de ambiente do Netlify
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Chave de API do Groq não configurada no servidor (GROQ_API_KEY).' }),
      };
    }

    const client = new Groq({ apiKey });

    const resposta = await client.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.8
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: resposta.choices[0].message.content }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Erro interno ao processar a requisição.' }),
    };
  }
};
