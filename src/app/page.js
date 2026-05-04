"use client";

import { useState } from "react";

export default function Home() {
  const [emails] = useState([
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
  ]);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCleanInbox = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/analyze-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emails)
      });

      const data = await res.json();
      console.log("AI RESPONSE:", data);
      setResults(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const grouped = {
    Urgent: [],
    Important: [],
    "Low Priority": [], 
    Spam: []
  };

  if (Array.isArray(results)) {
    results.forEach((r) => {
      if (grouped[r.category]) {
        grouped[r.category].push(r);
      }
    });
  }

  return (
    <div className="flex h-screen p-6 gap-6 bg-gray-50">

      {/* LEFT: Inbox */}
      <div className="w-1/2 bg-white border rounded-2xl p-4 shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">📩 Inbox</h1>

        {emails.map((email) => (
          <div key={email.id} className="border-b py-3">
            <p className="font-semibold text-gray-800">{email.subject}</p>
            <p className="text-sm text-gray-500">{email.sender}</p>
          </div>
        ))}

        <button
          onClick={handleCleanInbox}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? "Analyzing..." : "Clean My Inbox"}
        </button>
      </div>

      {/* RIGHT: AI Panel */}
      <div className="w-1/2 bg-white border rounded-2xl p-4 shadow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Insights</h1>

        {!results && (
          <p className="text-gray-500">
            Click "Clean My Inbox" to analyze emails.
          </p>
        )}

        {Array.isArray(results) && results.length > 0 && (
          <div className="space-y-6">

            {/* Urgent */}
            {grouped["Urgent"].length > 0 && (
              <div>
                <h2 className="font-bold text-red-500 mb-2">🔴 Urgent</h2>
                <div className="space-y-2">
                  {grouped["Urgent"].map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-red-500"
                    >
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Action: {r.action}
                      </p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">
                          Suggested reply: {r.suggested_reply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important */}
            {grouped["Important"].length > 0 && (
              <div>
                <h2 className="font-bold text-yellow-500 mb-2">🟡 Important</h2>
                <div className="space-y-2">
                  {grouped["Important"].map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-yellow-500"
                    >
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Action: {r.action} 
                      </p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">
                          Suggested reply: {r.suggested_reply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {grouped["Low Priority"].length > 0 && (
              <div>
                <h2 className="font-bold text-gray-500 mb-2">⚪ Low Priority</h2>
                <div className="space-y-2">
                  {grouped["Low Priority"].map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-gray-400"
                    >
                      <p className="text-sm font-semibold text-gray-800">{r.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Action: {r.action}
                      </p>
                      {r.suggested_reply && (
                        <p className="text-xs text-blue-500 mt-1 italic">
                          Suggested reply: {r.suggested_reply}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {grouped["Spam"].length > 0 && (
              <div>
                <h2 className="font-bold text-orange-400 mb-2">🚫 Spam</h2>
                <div className="space-y-2">
                  {grouped["Spam"].map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl shadow-sm bg-white border-l-4 border-orange-400"
                    >
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
