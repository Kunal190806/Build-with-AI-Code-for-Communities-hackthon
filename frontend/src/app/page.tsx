"use client";

import Link from "next/link";
import { ArrowRight, MapPin, BarChart3, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans text-gray-100">
      <header className="w-full bg-gray-900 shadow-md border-b border-gray-800 py-6 px-8 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">People's Priorities</h1>
        </div>
        <nav className="flex gap-6">
          <Link href="/report" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">Citizen Portal</Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">MP Dashboard</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-8">
            AI for Constituency <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Development Planning</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A centralized decision-support system empowering citizens to report issues and enabling officials to make data-driven, prioritized development decisions.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/report" className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/30">
              Report an Issue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="group flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm">
              View MP Dashboard
              <BarChart3 className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <div className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-900/40 border border-blue-800/50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="text-blue-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3">Multilingual Ingestion</h3>
            <p className="text-gray-400">Submit requests in 10+ Indian languages using text, voice, or images with GPS tagging.</p>
          </div>
          
          <div className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-indigo-900/40 border border-indigo-800/50 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="text-indigo-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3">AI Prioritization</h3>
            <p className="text-gray-400">Automatically rank issues based on urgency, sentiment, and demographic impact using XAI.</p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-purple-900/40 border border-purple-800/50 rounded-full flex items-center justify-center mb-6">
              <Users className="text-purple-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-3">Data-Driven Action</h3>
            <p className="text-gray-400">Provide MPs and Administrators with clear heatmaps and actionable insights for resource allocation.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
