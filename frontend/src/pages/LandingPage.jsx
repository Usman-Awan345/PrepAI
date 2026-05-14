import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiMic, 
  FiFileText, 
  FiZap, 
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiChevronRight
} from 'react-icons/fi';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  const features = [
    { icon: FiMessageSquare, title: 'AI Chat Assistant', description: 'Get instant help with coding questions, DSA, and interview prep from our advanced AI mentor.' },
    { icon: FiZap, title: 'Mock Interviews', description: 'Practice with realistic technical interviews across multiple domains like Frontend, Backend, DSA & more.' },
    { icon: FiMic, title: 'Voice Interviews', description: 'Experience real interview scenarios with voice recognition and speech synthesis technology.' },
    { icon: FiFileText, title: 'Resume Analyzer', description: 'Get AI-powered resume analysis with ATS scoring and personalized improvement suggestions.' },
    { icon: FiTrendingUp, title: 'Progress Tracking', description: 'Monitor your improvement with detailed analytics and performance metrics.' },
    { icon: FiShield, title: 'Smart Feedback', description: 'Receive instant, constructive feedback on your answers to accelerate learning.' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Software Engineer', content: 'This platform helped me land my dream job at Google. The mock interviews were incredibly realistic!' },
    { name: 'Michael Chen', role: 'Frontend Developer', content: 'The AI feedback is spot-on. It caught things I never would have noticed on my own.' },
    { name: 'Emily Rodriguez', role: 'Full Stack Developer', content: 'The voice interview feature is a game-changer. It really helps simulate real interview pressure.' },
  ];

  const faqs = [
    { q: 'Is this platform free?', a: 'Yes! We offer a generous free tier with access to all core features using our free AI APIs.' },
    { q: 'What interview types are available?', a: 'We offer Frontend, Backend, MERN Stack, JavaScript, React, Node.js, DSA, and HR interviews.' },
    { q: 'How does the voice interview work?', a: 'Using your browser\'s speech recognition and synthesis APIs for a seamless experience.' },
    { q: 'Can I save my interviews?', a: 'Yes, all your interviews and chats are saved for review and progress tracking.' },
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FiZap className="text-white text-xl" />
              </div>
                  <span className="text-2xl font-bold gradient-text">AI Interview</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <a href="#features" className="text-zinc-300 hover:text-white transition">Features</a>
                  <a href="#testimonials" className="text-zinc-300 hover:text-white transition">Testimonials</a>
                  <a href="#faq" className="text-zinc-300 hover:text-white transition">FAQ</a>
                </div>
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-zinc-300 hover:text-white transition">Sign In</Link>
                  <Link to="/register" className="btn-primary px-6 py-2">Get Started</Link>
                </div>
              </div>
            </div>
          </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-32 pb-20 px-6"
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full glass border border-zinc-700 mb-6">
              <span className="text-xs text-purple-400">✨ AI-Powered Interview Preparation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Master Your Next
              <span className="gradient-text"> Tech Interview</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Practice with our advanced AI interviewer, get real-time feedback, 
              and boost your confidence for technical interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Free Practice
                <FiChevronRight className="inline ml-2" />
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <div className="glass-card p-2 rounded-2xl max-w-4xl mx-auto">
              <img 
                src="https://placehold.co/1200x600/1a1a1a/ffffff?text=AI+Interview+Demo" 
                alt="Dashboard Preview"
                className="rounded-xl w-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="gradient-text"> Interview Success</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Everything you need to prepare effectively for your next technical interview
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 bg-gradient-to-b from-transparent to-zinc-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by
              <span className="gradient-text"> Developers Worldwide</span>
            </h2>
            <p className="text-xl text-zinc-400">Join thousands of successful developers who landed their dream jobs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FiUsers className="text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-zinc-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-zinc-300 italic">"{testimonial.content}"</p>
                <div className="mt-4 flex text-purple-400">
                  {"★★★★★"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked
              <span className="gradient-text"> Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-zinc-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="gradient-border max-w-4xl mx-auto"
          >
            <div className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Start practicing today with our AI interviewer. It's free!
              </p>
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
                Get Started Now
                <FiChevronRight className="inline ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6">
        <div className="container mx-auto text-center text-zinc-400">
          <p>&copy; 2024 AI Interview Assistant. Made with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;