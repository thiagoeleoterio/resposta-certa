import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GenerateRequest {
  objective: string;
  tone: string;
  inputText: string;
}

export interface GeneratedResponse {
  recommended: string;
  short: string;
  friendly: string;
  firm: string;
  explanation: string;
}

export async function generateResponse({
  objective,
  tone,
  inputText,
}: GenerateRequest): Promise<GeneratedResponse> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: request, error: requestError } = await supabase
    .from("requests")
    .insert({
      user_id: user?.id,
      objective,
      tone,
      input_text: inputText,
      status: "processing",
      provider: "openai",
      model: "gpt-4o-mini",
    })
    .select()
    .single();

  if (requestError) {
    throw new Error(`Failed to create request: ${requestError.message}`);
  }

  const prompt = `
Objetivo: ${objective}
Tom: ${tone}
Texto de entrada: ${inputText}

Gere uma resposta estruturada nas seguintes categorias:
1. recommended: A recomendação principal
2. short: Uma versão curta e direta
3. friendly: Uma versão amigável e próxima
4. firm: Uma versão mais formal/confirmação
5. explanation: Explicação do porquê dessa resposta

Formato de saída: JSON com as chaves: recommended, short, friendly, firm, explanation
`;

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!apiResponse.ok) {
    // Atualiza request status para failed
    await supabase.from("requests").update({ status: "failed" }).eq("id", request.id);
    const errorBody = await apiResponse.text();
    throw new Error(`OpenAI API error: ${errorBody}`);
  }

  const openaiData = await apiResponse.json();

  const content =
    openaiData.choices?.[0]?.message?.content || "Desculpe, não foi possível gerar a resposta.";

  let parsed: GeneratedResponse;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {
      recommended: content,
      short: content,
      friendly: content,
      firm: content,
      explanation: "Resposta gerada pela IA",
    };
  }

  const { error: responseError } = await supabase
    .from("responses")
    .insert({
      request_id: request.id,
      recommended: parsed.recommended,
      short: parsed.short,
      friendly: parsed.friendly,
      firm: parsed.firm,
      explanation: parsed.explanation,
    });

  if (responseError) {
    throw new Error(`Failed to save response: ${responseError.message}`);
  }

  // Atualiza request status para success
  await supabase.from("requests").update({ status: "success" }).eq("id", request.id);

  return parsed;
}