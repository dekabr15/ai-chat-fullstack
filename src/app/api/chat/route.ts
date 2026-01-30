import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export async function GET() {
  return new Response("ok", { status: 200 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return new Response("Некорректный запрос", { status: 400 });
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: parsed.data.messages,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      console.error("OpenAI error:", await upstream.text());
      return new Response("Сервис временно недоступен. Попробуйте позже.", {
        status: 503,
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(Boolean);

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;

              const data = line.replace("data:", "").trim();
              if (data === "[DONE]") continue;

              const json = JSON.parse(data);
              const token = json.choices?.[0]?.delta?.content;

              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Server error:", error);

    return new Response("Сервис временно недоступен. Попробуйте позже.", {
      status: 503,
    });
  }
}
