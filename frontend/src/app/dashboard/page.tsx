"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, BarChart3, MessageSquare, X, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Map to prevent SSR issues with Leaflet
const Map = dynamic(() => import("../../components/Map"), { ssr: false, loading: () => <div className="w-full h-full bg-gray-900 rounded-xl animate-pulse flex items-center justify-center text-gray-500 border border-gray-800">Loading Map...</div> });

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority_score: number;
  sentiment: string;
  urgency: string;
  explanation: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface Stats {
  total_issues: number;
  high_priority: number;
  resolved: number;
  pending: number;
}

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats>({ total_issues: 0, high_priority: 0, resolved: 0, pending: 0 });

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your AI Assistant. Ask me anything about the constituency data.' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTakeAction = (issueTitle: string) => {
    setToastMessage(`Action initiated for: ${issueTitle}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, statsRes] = await Promise.all([
          fetch("http://localhost:8000/dashboard/issues"),
          fetch("http://localhost:8000/dashboard/stats")
        ]);
        
        if (issuesRes.ok) setIssues(await issuesRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data. Make sure backend is running.", error);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: "Roads", count: issues.filter(i => i.category === "Roads").length },
    { name: "Water", count: issues.filter(i => i.category === "Water Supply").length },
    { name: "Power", count: issues.filter(i => i.category === "Electricity").length },
    { name: "Health", count: issues.filter(i => i.category === "Healthcare").length },
  ];

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to the AI server.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans relative text-gray-100">
      <header className="w-full bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <Link href="/" className="flex items-center text-gray-300 hover:text-blue-400 transition mr-6">
            <ArrowLeft className="w-5 h-5 mr-1" />
          </Link>
          <h1 className="text-xl font-bold text-white">MP Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">Live AI Analytics</div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Reports</h3>
              <BarChart3 className="text-blue-400 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total_issues}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">High Urgency</h3>
              <AlertCircle className="text-red-400 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-red-500">{stats.high_priority}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Pending Action</h3>
              <Clock className="text-yellow-400 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Resolved</h3>
              <CheckCircle2 className="text-green-400 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-green-500">{stats.resolved}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-800 h-[400px]">
            <h3 className="text-lg font-bold text-white mb-4 px-2">Constituency Issue Heatmap</h3>
            <div className="w-full h-[320px] relative z-0 rounded-xl overflow-hidden border border-gray-700">
              <Map issues={issues} />
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Issues by Category</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip cursor={{ fill: '#1f2937' }} contentStyle={{ borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Prioritized Issue List */}
        <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">AI Prioritized Action List</h3>
            <p className="text-sm text-gray-400 mt-1">Issues are ranked by the Explainable AI (XAI) engine based on urgency, sentiment, and demographic impact.</p>
          </div>
          <div className="divide-y divide-gray-800">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No issues found. Wait for data or check backend connection.</div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="p-6 hover:bg-gray-800/50 transition flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center bg-gray-950 text-red-500 rounded-xl p-3 border border-red-900/50 shadow-inner">
                    <span className="text-xs uppercase font-bold tracking-wider mb-1 text-gray-400">Score</span>
                    <span className="text-3xl font-black">{issue.priority_score}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-white">{issue.title}</h4>
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-full border border-gray-700">{issue.category}</span>
                      <span className="px-2.5 py-1 bg-red-900/30 text-red-400 border border-red-900/50 text-xs font-semibold rounded-full flex items-center gap-1">
                        {issue.urgency} Urgency
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{issue.description}</p>
                    <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-900/50 border border-blue-800 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mt-0.5">XAI</div>
                        <p className="text-sm text-blue-100 leading-snug">
                          <span className="font-semibold text-blue-300">AI Recommendation:</span> {issue.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <button 
                      onClick={() => handleTakeAction(issue.title)}
                      className="bg-gray-800 border border-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 font-medium px-4 py-2 rounded-lg transition text-sm active:scale-95 shadow-sm"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MP Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden"
            >
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold">Constituency AI Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-blue-700 p-1 rounded transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 text-gray-500 rounded-2xl rounded-tl-none p-3 shadow-sm flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about your constituency..." 
                  className="flex-1 bg-gray-950 text-white border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                />
                <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-transform hover:scale-105 flex items-center justify-center float-right border border-blue-500"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 bg-gray-800 text-white border border-gray-700 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
