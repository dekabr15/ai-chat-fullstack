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
  return Response.json({ ok: true });
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
  const bodyJson = await req.json();
  const { messages } = schema.parse(bodyJson);

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    }),
  });

  const upstreamBody = upstream.body;

  if (!upstreamBody) {
    return new Response("No stream", { status: 500 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader();

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
}
