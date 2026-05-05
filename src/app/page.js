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
  },
  {
    id: 8,
    subject: "Can you review this?",
    body: "Hey, can you take a look at the document I sent and give feedback by tonight?",
    sender: "teammate@company.com"
  },
  {
    id: 9,
    subject: "Lunch tomorrow?",
    body: "Are you free for lunch tomorrow around noon?",
    sender: "friend@gmail.com"
  },
  {
    id: 10,
    subject: "Security alert: New login detected",
    body: "We detected a login from a new device. If this wasn't you, reset your password immediately.",
    sender: "security@bank.com"
  },
  {
    id: 11,
    subject: "Weekly newsletter",
    body: "Here's your weekly roundup of news and updates.",
    sender: "newsletter@media.com"
  },
  {
    id: 12,
    subject: "Action required: Submit timesheet",
    body: "Please submit your timesheet by EOD today.",
    sender: "hr@company.com"
  },
  {
    id: 13,
    subject: "Follow-up on our meeting",
    body: "Great speaking earlier. Could you send over the files we discussed?",
    sender: "client@business.com"
  },
  {
    id: 14,
    subject: "Flight check-in open",
    body: "Your flight check-in is now open. Please confirm your seat selection.",
    sender: "airline@travel.com"
  },
  {
    id: 15,
    subject: "Party this weekend 🎉",
    body: "We're hosting a party Saturday night—let me know if you can make it!",
    sender: "friend2@gmail.com"
  }
];

const emptyForm = () => ({ subject: "", sender: "", body: "" });

export default function Home() {
  const [mode, setMode] = useState("sample"); // "sample" | "custom"
  const [customForms, setCustomForms] = useState([emptyForm()]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [highlightedEmailId, setHighlightedEmailId] = useState(null);

  const populateReplyForm = (replyText) => {
    if (mode === "custom") {
      setCustomForms([...customForms, {
        subject: "Re: " + (customForms[customForms.length-1]?.subject || "Response"),
        sender: "",
        body: replyText
      }]);
    } else {
      setMode("custom");
      setCustomForms([{
        subject: "Reply",
        sender: "",
        body: replyText
      }]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      
      // If the data is an array, ensure each item has an id
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults(data.results || []);
      }
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

  // Improved function to find matching email ID
  const getMatchingEmailId = (analysisResult) => {
    if (mode !== "sample") return null;
    
    // Method 1: Try to match by the ID from the analysis result
    if (analysisResult.id && SAMPLE_EMAILS.some(email => email.id === analysisResult.id)) {
      return analysisResult.id;
    }
    
    // Method 2: Match by subject (most reliable)
    const emailBySubject = SAMPLE_EMAILS.find(email => 
      email.subject.toLowerCase() === analysisResult.original_subject?.toLowerCase() ||
      email.subject.toLowerCase() === analysisResult.summary?.toLowerCase().slice(0, 30) ||
      analysisResult.summary?.toLowerCase().includes(email.subject.toLowerCase())
    );
    if (emailBySubject) return emailBySubject.id;
    
    // Method 3: Match by sender and keywords
    if (analysisResult.summary) {
      const emailBySender = SAMPLE_EMAILS.find(email => {
        const summaryLower = analysisResult.summary.toLowerCase();
        const subjectLower = email.subject.toLowerCase();
        return summaryLower.includes(subjectLower) || subjectLower.includes(summaryLower.slice(0, 30));
      });
      if (emailBySender) return emailBySender.id;
    }
    
    return null;
  };

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
              <div 
                key={email.id} 
                onClick={() => setSelectedId(selectedId === email.id ? null : email.id)}
                className={`border-b py-3 px-2 cursor-pointer transition-all duration-200 rounded-lg ${
                  selectedId === email.id ? "bg-blue-50" : ""
                } ${
                  highlightedEmailId === email.id 
                    ? "bg-yellow-100 border-l-4 border-yellow-500 shadow-md scale-[1.01]" 
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-800">{email.subject}</p>
                <p className="text-sm text-gray-500">{email.sender}</p>

                {selectedId === email.id && (
                  <div className="mt-3 p-3 bg-white border rounded-lg text-sm text-gray-700">
                    {email.body}
                  </div>
                )}
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
      <div className="w-1/2 bg-white border rounded-2xl p-6 shadow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span>🧠</span> AI Insights
        </h1>

        {!results && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed rounded-xl">
            <p>Click "Analyze Inbox" to process your emails.</p>
          </div>
        )}

        {Array.isArray(results) && results.length > 0 && (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null;

              const colorMap = {
                Urgent: "border-red-500 text-red-500 bg-red-50",
                Important: "border-yellow-500 text-yellow-600 bg-yellow-50",
                "Low Priority": "border-gray-400 text-gray-500 bg-gray-50",
                Spam: "border-orange-400 text-orange-600 bg-orange-50"
              };

              return (
                <div key={category}>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${colorMap[category]}`}>
                    {category}
                  </div>
            
                  <div className="space-y-3">
                    {items.map((r, idx) => {
                      // Get matching email ID for highlighting
                      const matchingEmailId = getMatchingEmailId(r);
                      
                      return (
                        <div 
                          key={r.id || idx} 
                          className="p-4 rounded-xl shadow-sm bg-white border border-gray-100 border-l-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                          style={{ borderLeftColor: category === "Urgent" ? "#ef4444" : category === "Important" ? "#eab308" : category === "Spam" ? "#fb923c" : "#9ca3af" }}
                          
                          onMouseEnter={() => {
                            if (matchingEmailId) {
                              setHighlightedEmailId(matchingEmailId);
                            }
                          }}
                          onMouseLeave={() => {
                            setHighlightedEmailId(null);
                          }}
                        >
                          <p className="text-sm font-bold text-gray-800 leading-tight mb-2">{r.summary}</p>
                  
                          {/* Action and Suggested Reply Section */}
                          <div className="space-y-2 pt-2 border-t border-gray-50">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-gray-400 uppercase w-16 mt-0.5">Action:</span>
                              <p className="text-sm text-gray-700">{r.action}</p>
                            </div>

                            {r.suggested_reply && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-bold text-blue-400 uppercase w-16 mt-0.5">
                                    Reply:
                                  </span>
                                  <p className="text-sm text-blue-700 italic">
                                    "{r.suggested_reply}"
                                  </p>
                                </div>

                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => populateReplyForm(r.suggested_reply)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                                  >
                                    ↩️ Reply
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
