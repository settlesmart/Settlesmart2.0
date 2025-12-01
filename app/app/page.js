"use client";

import React, { useState } from "react";

const VISA_TYPES = [
  { value: "student", label: "Student" },
  { value: "work", label: "Work (H-1B / Skilled)" },
  { value: "family", label: "Family / Spouse" },
  { value: "startup", label: "Startup / Nomad" },
];

const COUNTRIES = [
  "India",
  "Brazil",
  "United Arab Emirates",
  "United Kingdom",
  "Canada",
  "United States",
  "Germany",
  "France",
  "Saudi Arabia",
  "Mexico",
];

export default function Page() {
  const [phase, setPhase] = useState("after"); // "before" | "after"
  const [origin, setOrigin] = useState("India");
  const [destination, setDestination] = useState("United States");
  const [visaType, setVisaType] = useState("work");
  const [anchorDate, setAnchorDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(null); // array of weeks
  const [countryNotes, setCountryNotes] = useState(null);
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const tasksFlat = plan ? plan.flatMap((w) => w.items) : [];
  const doneCount = tasksFlat.filter((t) => completed[t.label]).length;
  const progress = tasksFlat.length
    ? Math.round((doneCount / tasksFlat.length) * 100)
    : 0;

  async function generatePlan() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          origin,
          destination,
          visaType,
          anchorDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate plan");
      }

      const json = await res.json();
      setPlan(json.weeks || []);
      setCountryNotes(json.countryNotes || null);
      setCompleted({});
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Something went wrong generating your plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleTask(label) {
    setCompleted((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function copyPlan() {
    if (!plan) return;
    const lines = [];
    lines.push(
      `SettleSmart Plan — ${phase.toUpperCase()} — ${origin} → ${destination} (${visaType})`
    );
    lines.push("");
    plan.forEach((w) => {
      lines.push(w.title);
      w.items.forEach((t) => lines.push(`• ${t.label}`));
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
  }

  function downloadPlan() {
    if (!plan) return;
    const lines = [];
    lines.push(
      `SettleSmart Plan — ${phase.toUpperCase()} — ${origin} → ${destination} (${visaType})`
    );
    lines.push(`Anchor date: ${anchorDate}`);
    lines.push("");
    plan.forEach((w) => {
      lines.push(w.title);
      w.items.forEach((t) =>
        lines.push(`- ${t.label} (offset ~ ${t.daysOffset} days)`)
      );
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SettleSmart-Plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✳️</span>
            <span className="text-xl font-bold">SettleSmart</span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#how" className="hover:opacity-70">
              How it works
            </a>
            <a href="#app" className="hover:opacity-70">
              Try the app
            </a>
            <a href="#pricing" className="hover:opacity-70">
              Pricing
            </a>
          </nav>
          <button
            onClick={() =>
              document
                .getElementById("app")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Start free
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:grid md:grid-cols-2 md:gap-10 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
            🔒 Private & human-friendly · not legal advice
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            A Sherpa for your move{" "}
            <span className="text-slate-600">from visa to settling in.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-700">
            AI-generated, country-specific checklists and timelines for your
            first 30–90 days. Phone, bank, housing, IDs, health, and more in
            one calm view.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={generatePlan}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
            >
              {loading ? "Generating..." : "Generate my plan"}
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full border px-5 py-3 text-sm font-medium"
            >
              See how it works
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div>🤝 Community support</div>
            <div>🛡️ Your data stays with you</div>
          </div>
        </div>

        {/* Hero wizard card */}
        <div className="mt-10 md:mt-0">
          <div className="rounded-3xl bg-white/80 p-5 shadow-xl ring-1 ring-slate-100">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Build your arrival plan
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <button
                className={`rounded-full border px-3 py-2 ${
                  phase === "before"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : ""
                }`}
                onClick={() => setPhase("before")}
              >
                Before visa
              </button>
              <button
                className={`rounded-full border px-3 py-2 ${
                  phase === "after"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : ""
                }`}
                onClick={() => setPhase("after")}
              >
                After visa
              </button>
            </div>

            <div className="grid gap-3 text-sm">
              <div>
                <label className="text-xs text-slate-600">Origin</label>
                <select
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600">Destination</label>
                <select
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600">Visa type</label>
                <select
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                >
                  {VISA_TYPES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600">
                  Anchor date{" "}
                  {phase === "before"
                    ? "(today or target submission)"
                    : "(arrival date)"}
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">
                  Email (optional – to send your plan)
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={generatePlan}
              className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {loading ? "Generating..." : "Generate plan"}
            </button>

            {errorMsg && (
              <p className="mt-2 text-xs text-red-600">{errorMsg}</p>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-lg">🌍 Tell us your path</div>
              <p className="mt-2 text-sm text-slate-600">
                Before or after visa. Origin, destination, visa type, and your
                key date.
              </p>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-lg">🧩 We generate your plan</div>
              <p className="mt-2 text-sm text-slate-600">
                AI builds a 4-week checklist with country-specific tasks for
                banking, housing, IDs, and more.
              </p>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-lg">✅ You execute, we guide</div>
              <p className="mt-2 text-sm text-slate-600">
                Check items off, track progress, copy or download your plan, and
                stay calm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APP SECTION */}
      <section id="app" className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            Readiness & setup wizard
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Personalized plan for the phase you’re in. Check off tasks and track
            progress. Export anytime.
          </p>

          {plan && (
            <>
              <div className="mt-4 rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold">Your progress</span>{" "}
                    <span className="text-slate-500">
                      ({doneCount} of {tasksFlat.length} tasks)
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {progress}% complete
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    className="rounded-full border px-3 py-1"
                    onClick={copyPlan}
                  >
                    Copy plan
                  </button>
                  <button
                    className="rounded-full border px-3 py-1"
                    onClick={downloadPlan}
                  >
                    Download .txt
                  </button>
                  <button
                    className="rounded-full border px-3 py-1"
                    onClick={() => {
                      setCompleted({});
                      setPlan(null);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {countryNotes && (
                <div className="mt-4 rounded-2xl border bg-white p-4 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Country notes
                  </div>
                  <p className="whitespace-pre-line text-slate-700">
                    {countryNotes}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {plan.map((week, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-white p-4 text-sm"
                  >
                    <div className="font-semibold">{week.title}</div>
                    <p className="mb-3 text-xs text-slate-500">
                      Target window based on your anchor date
                    </p>
                    {week.items.map((item, i) => (
                      <label
                        key={item.label + i}
                        className="flex items-start gap-3 py-1"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={!!completed[item.label]}
                          onChange={() => toggleTask(item.label)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                    {week.items.length === 0 && (
                      <div className="text-xs text-slate-500">
                        No tasks this week.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!plan && (
            <p className="mt-4 text-sm text-slate-500">
              Fill out the form above and hit “Generate plan” to see your
              personalized checklist here.
            </p>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Simple pricing</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="font-semibold">Free</div>
              <p className="mt-1 text-slate-500">Generate and view your plan.</p>
              <ul className="mt-3 list-disc pl-5 text-slate-600">
                <li>Before & after visa modes</li>
                <li>4-week plan</li>
                <li>Copy to clipboard</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-slate-900 p-4 text-white">
              <div className="font-semibold">Pro — $9</div>
              <p className="mt-1 text-slate-200">Per move (demo pricing).</p>
              <ul className="mt-3 list-disc pl-5 text-slate-100">
                <li>Save progress</li>
                <li>Downloadable plan</li>
                <li>Access to future “Move Abroad Hub”</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="font-semibold">Teams</div>
              <p className="mt-1 text-slate-500">HR / universities (pilot).</p>
              <ul className="mt-3 list-disc pl-5 text-slate-600">
                <li>Dashboard for multiple movers</li>
                <li>Templates, export & SSO</li>
                <li>Email support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-slate-500 md:grid-cols-3">
          <div>
            <div className="font-semibold text-slate-900">SettleSmart</div>
            <p>AI-guided readiness & post-visa setup. Not legal advice.</p>
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Contact</div>
            <a className="hover:opacity-80" href="mailto:team@settlesmart.co">
              team@settlesmart.co
            </a>
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-900">Privacy</div>
            <p>We store plans locally by default. You control what’s shared.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
