"use client";

import { useState } from "react";

const SAMPLE_EMAILS = [
  {
    id: 1,
    subject: "Final interview tomorrow",
    body: "Reminder for your final interview tomorrow at 10 AM.",
    sender: "hr@company.com"
  },
  {
    id: 2,
    subject: "50% OFF SALE!!!",
    body: "Huge discounts on all items. Limited time offer!",
    sender: "promo@store.com"
  },
  {
    id: 3,
    subject: "Team meeting notes",
    body: "Here are the notes from today's team meeting.",
    sender: "manager@company.com"
  },
  {
    id: 4,
    subject: "Your invoice is due",
    body: "Your payment of $249 is due in 2 days. Please complete it to avoid late fees.",
    sender: "billing@service.com"
  },
  {
    id: 5,
    subject: "You won a free iPhone!!!",
    body: "Congratulations! Click here to claim your free iPhone. Limited time only!",
    sender: "noreply@totally-legit.com"
  },
  {
    id: 6,
    subject: "Project deadline extended",
    body: "The deadline for the Q2 project has been moved to next Friday.",
    sender: "pm@company.com"
  },
  {
    id: 7,
    subject: "Doctor appointment reminder",
    body: "This is a reminder for your appointment on Thursday at 3 PM.",
    sender: "reminders@healthclinic.com"
  }
];

const emptyForm = () => ({ subject: "", sender: "", body: "" });

export default function Home() {
  const [mode, setMode] = useState("sample"); // "sample" | "custom"
  const [customForms, setCustomForms] = useState([emptyForm()]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const addForm = () => setCustomForms([...customForms, emptyForm()]);

  const removeForm = (index) => {
    if (customForms.length === 1) return;
    setCustomForms(customForms.filter((_, i) => i !== index));
  };

  const updateForm = (index, field, value) => {
    const updated = [...customForms];
    updated[index][field] = value;
    setCustomForms(updated);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const payload =
        mode === "sample"
          ? SAMPLE_EMAILS
          : customForms
              .filter((f) => f.subject || f.body)
              .map((f, i) => ({
                id: i + 100,
                subject: f.subject || "(No subject)",
                body: f.body,
                sender: f.sender || "unknown@email.com"
              }));

      const res = await fetch("http://localhost:8000/analyze-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResults(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const grouped = { Urgent: [], Important: [], "Low Priority": [], Spam: [] };
  if (Array.isArray(results)) {
    results.forEach((r) => {
      if (grouped[r.category]) grouped[r.category].push(r);
    });
  }

  return (
    <div className="flex h-screen p-6 gap-6 bg-gray-50">

      {/* LEFT: Inbox */}
      <div className="w-1/2 bg-white border rounded-2xl shadow flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">📩 Inbox</h1>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("sample")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "sample"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Sample Emails
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Paste Your Emails
            </button>
          </div>
        </div>

        {/* Email List or Custom Forms */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === "sample" ? (
            SAMPLE_EMAILS.map((email) => (
              <div key={email.id} className="border-b py-3">
                <p className="font-semibold text-gray-800">{email.subject}</p>
                <p className="text-sm text-gray-500">{email.sender}</p>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {customForms.map((form, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Email {index + 1}
                    </span>
                    {customForms.length > 1 && (
                      <button
                        onClick={() => removeForm(index)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Interview Tomorrow"
                        value={form.subject}
                        onChange={(e) => updateForm(index, "subject", e.target.value)}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 font-medium">From</label>
                      <input
                        type="text"
                        placeholder="e.g. hr@company.com"
                        value={form.sender}
                        onChange={(e) => updateForm(index, "sender", e.target.value)}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 font-medium">Body</label>
                      <textarea
                        rows={4}
                        placeholder="Paste the email body here..."
                        value={form.body}
                        onChange={(e) => updateForm(index, "body", e.target.value)}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addForm}
                className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 py-3 rounded-xl text-sm font-medium transition-all"
              >
                + Add Another Email
              </button>
            </div>
          )}
        </div>

        {/* Bottom Button */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={handleAnalyze}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-all"
          >
            {loading ? "AI is analyzing..." : "Analyze Inbox"}
          </button>
        </div>
      </div>

      {/* RIGHT: AI Panel */}
      <div className="w-1/2 bg-white border rounded-2xl p-4 shadow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Insights</h1>

        {!results && (
          <p className="text-gray-500">Click "Analyze Inbox" to analyze emails.</p>
        )}

        {Array.isArray(results) && results.length > 0 && (
          <div className="space-y-6">

            {grouped["Urgent"].length > 0 && (
              <div>
                <h2 className="font-bold text-red-500 mb-2">🔴 Urgent</h2>
                <div className="space-y-2">
                  {grouped["Urgent"].map((r) => (
                    <div key={r.id} className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-red-500">
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">Action: {r.action}</p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">Suggested reply: {r.suggested_reply}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {grouped["Important"].length > 0 && (
              <div>
                <h2 className="font-bold text-yellow-500 mb-2">🟡 Important</h2>
                <div className="space-y-2">
                  {grouped["Important"].map((r) => (
                    <div key={r.id} className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-yellow-500">
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">Action: {r.action}</p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">Suggested reply: {r.suggested_reply}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {grouped["Low Priority"].length > 0 && (
              <div>
                <h2 className="font-bold text-gray-400 mb-2">⚪ Low Priority</h2>
                <div className="space-y-2">
                  {grouped["Low Priority"].map((r) => (
                    <div key={r.id} className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-gray-400">
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">Action: {r.action}</p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">Suggested reply: {r.suggested_reply}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {grouped["Spam"].length > 0 && (
              <div>
                <h2 className="font-bold text-orange-400 mb-2">🚫 Spam</h2>
                <div className="space-y-2">
                  {grouped["Spam"].map((r) => (
                    <div key={r.id} className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-orange-400">
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">Action: {r.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
