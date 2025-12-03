import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  const apiKey = process.env.OPENAI_API_KEY;

  // If the key is missing, return a clear error (and log it)
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY in environment");
    return NextResponse.json(
      { error: "Server is missing OpenAI API key." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { phase, origin, destination, visaType, anchorDate } = body;

  const systemPrompt = `
You are an immigration and relocation onboarding assistant.
You create practical 4 week checklists for newcomers that cover:

- Phone/SIM and 2FA
- Banking and payments
- Housing and address proof
- Local IDs (SSN, SIN, national ID, etc.) where applicable
- Health insurance and care
- School/university or employer onboarding if relevant
- Taxes and basic legal registrations

Return JSON only. No prose, no extra text.
JSON shape:
{
  "weeks": [
    { "title": "Week 1", "items": [ { "label": "...", "daysOffset": 0, "category": "phone" } ] },
    ...
  ],
  "countryNotes": "short practical tips for this corridor"
}
  `.trim();

  const userPrompt = `
Phase: ${phase}
From: ${origin}
To: ${destination}
Visa type: ${visaType}
Anchor date: ${anchorDate}

Create a 4 week plan aligned to their first 30–60 days (before or after arrival depending on phase).
Use sensible daysOffset (0–30). Tasks must be clear and atomic.
  `.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", text);
      return NextResponse.json(
        { error: "OpenAI error from backend." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let plan;
    try {
      plan = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "content:", content);
      // Fallback: return an empty but valid structure
      plan = {
        weeks: [],
        countryNotes:
          "We could not parse the AI response. Please try again or contact support.",
      };
    }

    return NextResponse.json(plan);
  } catch (err) {
    console.error("Unhandled error in /api/plan:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
