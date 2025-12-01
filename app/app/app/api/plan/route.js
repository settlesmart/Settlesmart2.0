import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json();

  const { phase, origin, destination, visaType, anchorDate } = body;

  const schema = {
    name: "RelocationPlan",
    schema: {
      type: "object",
      properties: {
        weeks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    daysOffset: { type: "number" },
                    category: { type: "string" },
                  },
                  required: ["label", "daysOffset"],
                },
              },
            },
            required: ["title", "items"],
          },
        },
        countryNotes: { type: "string" },
      },
      required: ["weeks"],
    },
  };

  const prompt = `
You are an immigration & relocation onboarding assistant.

User profile:
- Phase: ${phase}
- From: ${origin}
- To: ${destination}
- Visa type: ${visaType}
- Anchor date: ${anchorDate}

Return a 4-week plan of tasks aligned to their first 30–60 days
(before or after arrival depending on phase). Include tasks for:

- Phone/SIM and 2FA
- Banking and payments
- Housing and address proof
- Local IDs (SSN, SIN, national ID, etc.) where applicable
- Health insurance and care
- School/university or employer onboarding if relevant
- Taxes and basic legal registrations

Each task must be clear and atomic. Use daysOffset relative to the anchor date.
Add a short countryNotes paragraph with practical tips for the destination.
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: { type: "json_schema", json_schema: schema },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error:", text);
    return NextResponse.json({ error: "OpenAI error" }, { status: 500 });
  }

  const data = await res.json();

  const raw =
    data.output?.[0]?.content?.[0]?.text ??
    data.choices?.[0]?.message?.content ??
    "{}";

  let plan;
  try {
    plan = JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", e);
    plan = { weeks: [], countryNotes: "" };
  }

  return NextResponse.json(plan);
}
