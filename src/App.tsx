import Navbar from './components/NavBar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Social Proof Bar */}
        <div className="bg-slate-50 border-y border-slate-100 py-10 overflow-hidden whitespace-nowrap">
          <div className="flex animate-marquee gap-16 items-center">
             {['OpenAI', 'Microsoft', 'Google', 'Khan Academy', 'Meta', 'NVIDIA'].map(partner => (
               <div key={partner} className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <span className="font-black text-2xl tracking-tighter">{partner}</span>
               </div>
             ))}
             {/* Duplicate for seamless loop */}
             {['OpenAI', 'Microsoft', 'Google', 'Khan Academy', 'Meta', 'NVIDIA'].map(partner => (
               <div key={`dup-${partner}`} className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <span className="font-black text-2xl tracking-tighter">{partner}</span>
               </div>
             ))}
          </div>
        </div>

        <Features />

        {/* How It Works Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                 <div className="relative">
                   <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800" 
                    alt="Learning Platform" 
                    className="rounded-3xl shadow-2xl"
                   />
                   <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl max-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Live Analysis</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Adapting course difficulty based on your last 3 responses...</p>
                   </div>
                 </div>
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-3xl lg:text-4xl font-bold mb-8 tracking-tight">How ELVA Transforms Learning</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Assess your knowledge</h4>
                      <p className="text-slate-600">Start with a quick chat with ELVA. She'll identify your current level and gaps in understanding.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Personalized Roadmap</h4>
                      <p className="text-slate-600">Get a custom learning path designed specifically for your goals and available time.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Dynamic Interaction</h4>
                      <p className="text-slate-600">As you learn, the system adapts. Stuck? ELVA provides alternative explanations until it clicks.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
             <div className="relative z-10">
               <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to start your journey?</h2>
               <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of learners who have already revolutionized their study habits with ELVA AI.</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                   Create Free Account
                 </button>
                 <button className="px-10 py-4 bg-blue-700 text-white border border-blue-500 rounded-2xl font-bold hover:bg-blue-800 transition-colors">
                   View Success Stories
                 </button>
               </div>
               <div className="mt-10 flex flex-wrap justify-center gap-8 text-blue-100 text-sm font-medium">
                 <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> No credit card required</div>
                 <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> All features included</div>
               </div>
             </div>
             {/* Background shapes */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-50"></div>
             <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-50"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
