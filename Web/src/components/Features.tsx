import { Brain, Zap, Target, BarChart3, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: "AI Personalization",
    description: "Our AI analyzes your learning style and adapts lessons to match your pace and preferences.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: Zap,
    title: "Interactive Lessons",
    description: "Engage with dynamic content that responds to your input, making learning more immersive.",
    color: "bg-amber-50 text-amber-600"
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    description: "Define your objectives and let ELVA build the shortest path to achieving them.",
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visualized analytics show your growth, strengths, and areas for improvement.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Clock,
    title: "On-Demand Access",
    description: "Learn anytime, anywhere. Your AI tutor is always ready to guide you through new topics.",
    color: "bg-rose-50 text-rose-600"
  },
  {
    icon: Users,
    title: "Community Learning",
    description: "Connect with others studying the same topics and share resources and insights.",
    color: "bg-cyan-50 text-cyan-600"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Everything You Need to Master Any Topic</h2>
          <p className="text-slate-600 text-lg">ELVA combines the power of LLMs with pedagogical research to create the most effective learning experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[100px] -z-10 opacity-50"></div>
    </section>
  );
};

export default Features;
