"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BrainCircuit, Activity, Calendar, Target, CheckCircle2, Mic, PlayCircle, Code2, Zap, Shield, Layers, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-black font-body overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-white relative">
      
      {/* Brutalist Grid Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(black 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed w-full z-50 px-6 md:px-12 py-4 flex items-center justify-between border-b-[4px] border-black bg-[var(--bg-base)] shadow-[0_4px_0px_0px_#000]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--accent-primary)] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
             <div className="w-5 h-5 bg-white border-2 border-black transform rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[26px] font-display font-black text-black leading-none tracking-tight flex items-center gap-2 uppercase">
              VibeShift <span className="text-[12px] px-2 py-0.5 bg-[var(--accent-live)] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transform -rotate-3">v2.0</span>
            </h1>
            <p className="text-[11px] text-black tracking-[0.15em] mt-1 font-bold uppercase border-t-2 border-black pt-0.5 w-max">Autonomous Agent</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] px-6 py-2">
          <Link href="#features" className="text-[15px] font-bold text-black uppercase hover:text-[var(--accent-primary)] transition-colors">Features</Link>
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <Link href="#how-it-works" className="text-[15px] font-bold text-black uppercase hover:text-[var(--accent-live)] transition-colors">Pipeline</Link>
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <Link href="#tech-stack" className="text-[15px] font-bold text-black uppercase hover:text-[var(--accent-primary)] transition-colors">Stack</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-[16px] font-black text-black uppercase hover:underline hidden sm:block px-4 py-2 bg-white border-2 border-transparent hover:border-black transition-all">Login</Link>
          <Link href="/auth" className="btn-primary text-[16px] px-6 py-3">
            Try Demo
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-48 pb-20 px-6 relative w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-5xl relative z-10 w-full mt-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 border-[4px] border-black bg-white text-black text-[15px] font-black uppercase tracking-widest mb-10 shadow-[6px_6px_0px_0px_#000] transform -rotate-1"
          >
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" /> Built for High-Performance Operators
          </motion.div>
          
          <h1 className="text-6xl md:text-[90px] lg:text-[120px] font-display font-black text-black tracking-tighter mb-8 leading-[0.9] uppercase">
            Never Miss <br/>
            A <span className="text-white bg-[var(--accent-primary)] px-6 mx-2 inline-block border-[6px] border-black transform rotate-2 shadow-[8px_8px_0px_0px_#000]">Deadline</span> Again.
          </h1>
          
          <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] max-w-3xl mx-auto mb-14 transform rotate-1">
            <p className="text-[18px] md:text-[22px] text-black leading-relaxed font-bold">
              Your autonomous AI productivity engine. VibeShift prioritizes tasks, dynamically schedules your calendar, and acts on your behalf <strong className="font-black bg-[var(--accent-live)] text-white px-2 py-0.5 border-2 border-black inline-block mt-2 sm:mt-0">before it's too late.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
            <Link href="/dashboard" className="btn-primary text-[20px] py-5 px-12 flex items-center gap-3 w-full sm:w-auto justify-center hover:-translate-y-1 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000]">
              <LayoutDashboard className="w-7 h-7" /> Enter Dashboard 
            </Link>
            <Link href="#how-it-works" className="bg-white text-black border-[4px] border-black font-bold uppercase text-[20px] py-5 px-12 flex items-center gap-3 w-full sm:w-auto justify-center transition-all shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000] hover:bg-gray-100">
              <PlayCircle className="w-7 h-7 text-[var(--accent-live)]" /> Watch Demo
            </Link>
          </div>

          {/* Brutalist Abstract Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full max-w-5xl mx-auto h-[450px] md:h-[600px] bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_#000] flex flex-col relative overflow-hidden"
          >
            {/* Fake Window Header */}
            <div className="h-14 border-b-[6px] border-black bg-black flex items-center justify-between px-6">
               <div className="flex gap-3">
                 <div className="w-5 h-5 border-[3px] border-black bg-[var(--color-danger)] rounded-full"></div>
                 <div className="w-5 h-5 border-[3px] border-black bg-[var(--color-warning)] rounded-full"></div>
                 <div className="w-5 h-5 border-[3px] border-black bg-[var(--color-success)] rounded-full"></div>
               </div>
               <div className="font-mono text-[14px] text-white font-bold tracking-widest uppercase">VibeShift / Dashboard UI</div>
               <div className="w-5 h-5"></div>
            </div>
            
            <div className="flex-1 flex p-8 gap-8 relative bg-[var(--bg-base)]">
               {/* Sidebar mock */}
               <div className="w-1/4 border-[4px] border-black bg-white hidden md:flex flex-col p-5 shadow-[6px_6px_0px_0px_#000]">
                 <div className="h-10 w-full bg-black mb-8 border-[3px] border-black"></div>
                 <div className="h-24 w-full bg-[var(--accent-primary)] border-[4px] border-black p-4 flex flex-col justify-between mb-6 shadow-[4px_4px_0px_0px_#000]">
                    <div className="h-4 w-1/3 bg-white border-2 border-black"></div>
                    <div className="h-6 w-2/3 bg-white border-2 border-black"></div>
                 </div>
                 <div className="h-12 w-full border-[3px] border-black mb-4 bg-[#EEEEEE]"></div>
                 <div className="h-12 w-full border-[3px] border-black mb-4 bg-[#EEEEEE]"></div>
                 <div className="h-12 w-full border-[3px] border-black mb-4 bg-[#EEEEEE]"></div>
               </div>

               {/* Main content mock */}
               <div className="flex-1 flex flex-col gap-8">
                 <div className="flex justify-between items-center bg-[var(--accent-live)] border-[4px] border-black p-5 shadow-[6px_6px_0px_0px_#000]">
                   <div className="h-8 w-1/3 bg-white border-2 border-black"></div>
                   <div className="h-12 w-12 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                     <Activity className="w-7 h-7 text-black" />
                   </div>
                 </div>
                 
                 <div className="flex-1 bg-white border-[4px] border-black p-8 flex flex-col gap-5 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 50%)', backgroundSize: '16px 16px' }}></div>
                    <div className="h-8 w-1/4 bg-black mb-4 border-2 border-black relative z-10"></div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 w-full bg-[var(--bg-base)] border-[3px] border-black flex items-center px-6 gap-6 hover:bg-[#EEEEEE] transition-colors shadow-[4px_4px_0px_0px_#000] relative z-10">
                        <div className="w-8 h-8 border-[3px] border-black bg-white"></div>
                        <div className="flex-1">
                          <div className="h-5 w-1/2 bg-black mb-2"></div>
                          <div className="h-3 w-1/4 bg-[#888888]"></div>
                        </div>
                        {i === 1 && <div className="h-8 w-28 bg-[var(--accent-primary)] border-[3px] border-black"></div>}
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tech Stack Marquee */}
        <div id="tech-stack" className="mt-40 w-full border-y-[6px] border-black bg-[var(--accent-live)] py-14 relative z-10 overflow-hidden shadow-[0_10px_0px_0px_#000] transform -rotate-1 scale-105">
          <div className="max-w-6xl mx-auto px-6 text-center mb-8">
            <p className="text-[18px] text-white font-black tracking-[0.2em] uppercase bg-black inline-block px-4 py-1">Powered By Next-Gen Tech</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 text-white">
             <div className="flex items-center gap-4 font-display text-3xl font-black uppercase"><Code2 className="w-10 h-10" /> Next.js 15</div>
             <div className="flex items-center gap-4 font-display text-3xl font-black uppercase"><Zap className="w-10 h-10 text-[var(--color-warning)]" /> Gemini 2.0 Flash</div>
             <div className="flex items-center gap-4 font-display text-3xl font-black uppercase"><Shield className="w-10 h-10 text-[var(--color-success)]" /> App Check</div>
             <div className="flex items-center gap-4 font-display text-3xl font-black uppercase"><Activity className="w-10 h-10 text-black" /> Upstash</div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="mt-40 max-w-6xl w-full relative z-10">
          <div className="mb-20 border-b-[6px] border-black pb-8 flex flex-col md:flex-row items-end justify-between">
            <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000]">
              <h2 className="text-[50px] md:text-[70px] font-display font-black text-black tracking-tight uppercase leading-none">The Pipeline</h2>
              <p className="text-[22px] text-black font-bold mt-4 bg-[var(--color-warning)] inline-block px-2 border-2 border-black">A completely autonomous engine.</p>
            </div>
            <div className="hidden md:block w-32 h-32 border-[6px] border-black bg-[var(--accent-primary)] shadow-[10px_10px_0px_0px_#000] relative transform rotate-12 mt-8 md:mt-0">
               <div className="absolute inset-0 flex items-center justify-center">
                 <Zap className="w-16 h-16 text-white" />
               </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] h-[6px] bg-black"></div>
            
            {[
              { step: "01", title: "Chaos Dump", desc: "Upload an image of your messy whiteboard or record a quick voice note. Gemini extracts structured tasks instantly.", icon: <Layers />, color: "var(--accent-primary)" },
              { step: "02", title: "Intelligent Schedule", desc: "The AI calculates 'Deadline Drift Velocity' and automatically blocks time on your Calendar to ensure completion.", icon: <Calendar />, color: "var(--accent-live)" },
              { step: "03", title: "Autopilot Mode", desc: "If you fall behind, the agent autonomously reschedules your tasks and drafts extension emails to stakeholders.", icon: <BrainCircuit />, color: "var(--color-success)" }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className="w-32 h-32 bg-white border-[6px] border-black flex items-center justify-center relative z-10 mb-8 shadow-[10px_10px_0px_0px_#000] group-hover:-translate-y-2 group-hover:shadow-[14px_14px_0px_0px_#000] transition-all" style={{ borderBottomColor: item.color, borderBottomWidth: '12px' }}>
                   <div className="absolute -top-5 -left-5 text-[20px] font-black text-white px-4 py-1 border-[4px] border-black shadow-[6px_6px_0px_0px_#000]" style={{ backgroundColor: item.color }}>{item.step}</div>
                   {React.cloneElement(item.icon as React.ReactElement, { className: "w-14 h-14 text-black" })}
                </div>
                <div className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] w-full transform group-hover:rotate-1 transition-all">
                  <h3 className="text-[24px] font-display font-black text-black mb-4 uppercase">{item.title}</h3>
                  <p className="text-[16px] text-black font-bold leading-relaxed text-left border-t-[3px] border-black pt-4">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Features Grid */}
        <div id="features" className="mt-40 max-w-6xl w-full relative z-10">
          <div className="text-center mb-16 bg-black text-white py-16 px-6 border-[6px] border-black shadow-[16px_16px_0px_0px_var(--accent-primary)] transform rotate-1">
            <h2 className="text-[40px] md:text-[60px] font-display font-black tracking-tight uppercase leading-none mb-6">"The Last-Minute Life Saver"</h2>
            <p className="text-[22px] font-bold bg-[var(--accent-live)] inline-block px-4 py-2 border-[3px] border-black text-white">How VibeShift tackles Problem Statement 1</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-[var(--accent-primary)] border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">Smart Priority</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                Our Gemini-powered agent autonomously categorizes and ranks your tasks, assignments, and bills to ensure the most critical items are surfaced first.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-[var(--accent-live)] border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">AI Scheduling</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                Deep integration with Google Calendar allows the AI to dynamically find open slots, block out deep-work time, and gracefully adjust when meetings run late.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-[var(--color-success)] border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <Activity className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">Interventions</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                By monitoring your task density and deadline proximity, the agent calculates a live Cognitive Load Score and intervenes before you burn out.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-[var(--color-warning)] border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <Target className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">Goal Tracking</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                Maintain consistency with dynamic streak tracking, daily flow visualization, and session progress metrics to build robust productivity habits over time.
              </p>
            </motion.div>

             {/* Feature 5 */}
             <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <Mic className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">Voice Assistant</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                Interact with your AI companion hands-free. Command VibeShift to log tasks, check deadlines, or initiate focus mode using just your voice.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div whileHover={{ y: -5 }} className="glass-card group hover:bg-black hover:text-white transition-colors duration-200">
              <div className="w-16 h-16 bg-[var(--color-danger)] border-[4px] border-black flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_#000]">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[26px] font-display font-black mb-4 uppercase leading-tight">Auto Execution</h3>
              <p className="text-[16px] font-bold leading-relaxed">
                It doesn't just remind you; it acts. The agent breaks down massive projects into atomic sub-tasks and suppresses non-critical notifications.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Call to Action Footer */}
        <div className="mt-40 w-full max-w-5xl mx-auto text-center relative z-10 bg-white border-[8px] border-black p-20 shadow-[20px_20px_0px_0px_var(--accent-live)] transform -rotate-1 mb-20">
           <div className="absolute -top-8 -left-8 w-16 h-16 border-[5px] border-black bg-[var(--color-warning)] shadow-[6px_6px_0px_0px_#000]"></div>
           <div className="absolute -bottom-8 -right-8 w-16 h-16 border-[5px] border-black bg-[var(--accent-primary)] shadow-[6px_6px_0px_0px_#000]"></div>
           
           <h2 className="text-[60px] md:text-[80px] font-display font-black text-black mb-8 tracking-tight uppercase leading-[0.9]">Ready to conquer<br/>your deadlines?</h2>
           <p className="text-[24px] font-bold text-black mb-12 max-w-2xl mx-auto border-b-[6px] border-[var(--accent-live)] pb-6 inline-block bg-white">Join the waitlist or try the demo today.</p>
           
           <div className="flex justify-center">
             <Link href="/auth" className="btn-primary text-[24px] py-6 px-16 inline-flex items-center gap-4 shadow-[10px_10px_0px_0px_#000] hover:shadow-[14px_14px_0px_0px_#000] transition-all transform hover:-translate-y-2 bg-[var(--accent-primary)] border-[4px] border-black">
                Start Using VibeShift <ArrowRight className="w-8 h-8" />
             </Link>
           </div>
        </div>

        {/* Simple Footer */}
        <div className="border-t-[6px] border-black pt-12 pb-12 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto text-[18px] text-black font-black uppercase">
           <div className="flex items-center gap-4 mb-6 md:mb-0 bg-white border-[4px] border-black px-6 py-3 shadow-[6px_6px_0px_0px_#000] transform rotate-1">
             <div className="w-5 h-5 bg-[var(--accent-primary)] border-[3px] border-black transform rotate-45"></div>
             <span className="tracking-widest">VibeShift AI</span>
           </div>
           <p className="text-center md:text-right bg-[var(--accent-live)] text-white border-[4px] border-black px-6 py-3 shadow-[6px_6px_0px_0px_#000] transform -rotate-1">Powered by Next.js & Gemini Intelligence.</p>
        </div>
      </main>
    </div>
  );
}
