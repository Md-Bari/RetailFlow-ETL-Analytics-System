"use client";

import Link from "next/link";
import { ArrowRight, Database, Settings2, BarChart3, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 font-sans">
      
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">RetailFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="pt-24 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.15]">
                Understand your retail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">datasets in minutes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Automate your ETL pipeline, perform deep Exploratory Data Analysis, and generate AI-powered reports with zero configuration.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-full transition-all hover:shadow-lg hover:shadow-blue-200">
                  Start analyzing now <ArrowRight size={18} />
                </Link>
                <Link href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-8 py-3.5 rounded-full transition-all">
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Everything you need to process data</h2>
              <p className="mt-4 text-lg text-gray-600">A unified platform from raw CSV to executive insights.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ETL Storage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload raw CSV files. RetailFlow automatically infers column types, handles missing values, and stores them securely in a PostgreSQL warehouse.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                  <Settings2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Deep EDA</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatically compute distributions, identify outliers via IQR, and get AI-assisted cleaning recommendations to fix skewness and anomalies.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Reporting</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate professional executive summaries, statistical trend analysis, and predictive forecasts powered by Gemini AI with one click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to transform your retail data?</h2>
            <Link href="/signup" className="inline-flex items-center gap-2 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 px-8 py-3.5 rounded-full transition-all hover:shadow-lg">
              Create your account <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RetailFlow Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
