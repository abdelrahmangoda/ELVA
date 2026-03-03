import { Search, Play, ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-blue-50/50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
            <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            >
            {/* Badge with "NEW" label and pulsing indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-6">
              <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              NEW: AI-POWERED PERSONALIZED LEARNING
            </div>

            {/* Main headline with gradient text */}
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              ELVA is the first AI learning companion <br />
              that doesn't just teach — it <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">understands you.</span>
            </h1>

            {/* Description paragraph */}
            <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Through real-time emotion awareness, personalized lessons, adaptive difficulty, 
              and intelligent feedback, ELVA transforms learning into a deeply human experience. 
              It senses confusion, prevents burnout, challenges boredom, and evolves with your 
              unique learning style — making every study session smarter, faster, and more effective.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                key={i}
                src={`https://i.pravatar.cc/100?u=user${i}`}
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
              </div>
              <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-600">
                Trusted by <span className="text-slate-900 font-bold">10,000,000+</span> learners
              </span>
              </div>
            </div>
            </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-[8px] border-white ring-1 ring-slate-100">
              <div className="bg-slate-900 aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none"></div>
                <div className="flex flex-col items-center justify-center text-center p-8">
                   <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Sparkles className="w-10 h-10 text-blue-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2 italic">Generating your learning path...</h3>
                   <div className="flex gap-2 mt-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                   </div>
                </div>
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Goal achieved</div>
                <div className="text-sm font-bold text-slate-900 leading-tight">Mastered Python Basics</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">Next Milestone</div>
                <div className="text-sm font-bold text-slate-900 leading-tight">Advanced Data Models</div>
              </div>
            </motion.div>

            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 -z-10 rounded-[3rem] blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;