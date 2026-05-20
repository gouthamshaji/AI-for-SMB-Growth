'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    location: '',
    orderValue: '500-1000'
  });

  const generateInitialAIContext = async () => {
    setIsInitializing(true);
    localStorage.setItem('businessContext', JSON.stringify(formData));
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: "I just signed up. Please welcome me briefly and give me ONE quick post suggestion to get started.",
          context: formData
        })
      });
      const resData = await response.json();
      
      if (resData.success && resData.data) {
         localStorage.setItem('initialChatData', JSON.stringify(resData.data));
      }
    } catch (e) {
      console.error("Failed to generate initial AI context", e);
    } finally {
      setIsInitializing(false);
      router.push('/chat');
    }
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
      generateInitialAIContext();
    } else if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('businessContext', JSON.stringify(formData));
    router.push('/chat');
  };

  return (
    <main className="min-h-screen w-full flex flex-col overflow-x-hidden relative bg-cream">
      <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md sticky top-0 z-10 w-full shrink-0 flex items-center justify-center border-b border-black/5">
        <div className="w-full max-w-3xl px-4 md:px-6 h-full flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="p-2 hover:bg-black/5 rounded-full transition-colors -ml-2"
          >
            <ArrowLeft size={24} className="text-dark-gray" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-dark-gray/30 uppercase tracking-[0.2em] mb-1">Step {step} of 3</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    s === step ? 'w-6 bg-orange' : 'w-1.5 bg-dark-gray/10'
                  }`} 
                />
              ))}
            </div>
          </div>
          <button 
            onClick={handleSkip}
            className="text-sm font-bold text-orange px-4 py-2 hover:bg-orange/5 rounded-full transition-colors -mr-4"
          >
            Skip
          </button>
        </div>
      </header>

      <div className="flex-1 py-4 md:py-8 flex flex-col w-full items-center justify-start md:justify-center">
        <div className="w-full max-w-md px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 md:space-y-10"
            >
              <div className="space-y-1.5 md:space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-brown leading-tight">Tell me about your business 🏠</h2>
                <p className="text-sm md:text-base text-dark-gray/50 font-medium">This helps me give you better ideas.</p>
              </div>
              
              <div className="space-y-4 md:space-y-8">
                <div className="space-y-1.5 md:space-y-3">
                  <label className="text-[10px] md:text-xs font-bold text-dark-gray/60 uppercase tracking-widest px-1">What do you sell?</label>
                  <input 
                    className="w-full h-12 md:h-16 bg-white rounded-input border-2 border-transparent focus:border-orange px-4 md:px-6 text-sm md:text-base text-dark-gray font-semibold shadow-sm outline-none transition-all placeholder:text-dark-gray/20" 
                    placeholder="e.g. Homemade chocolates" 
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 md:space-y-3">
                  <label className="text-[10px] md:text-xs font-bold text-dark-gray/60 uppercase tracking-widest px-1">Where are you located?</label>
                  <input 
                    className="w-full h-12 md:h-16 bg-white rounded-input border-2 border-transparent focus:border-orange px-4 md:px-6 text-sm md:text-base text-dark-gray font-semibold shadow-sm outline-none transition-all placeholder:text-dark-gray/20" 
                    placeholder="e.g. Pune, Maharashtra" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2 md:space-y-4">
                  <label className="text-[10px] md:text-xs font-bold text-dark-gray/60 uppercase tracking-widest px-1">Average order value?</label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-3">
                    {[
                      { id: 'under500', label: 'Under ₹500' },
                      { id: '500-1000', label: '₹500 - ₹1k' },
                      { id: '1000-2000', label: '₹1k - ₹2k' },
                      { id: 'above2000', label: 'Above ₹2k' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFormData({...formData, orderValue: opt.id})}
                        className={`flex items-center justify-between h-11 md:h-16 px-3.5 md:px-6 rounded-input text-[13px] md:text-base font-bold transition-all border-2 ${
                          formData.orderValue === opt.id 
                            ? 'bg-orange/5 border-orange text-orange' 
                            : 'bg-white border-transparent text-dark-gray'
                        }`}
                      >
                        {opt.label}
                        <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          formData.orderValue === opt.id ? 'border-orange bg-orange' : 'border-dark-gray/10'
                        }`}>
                          {formData.orderValue === opt.id && <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-brown leading-tight">Connect WhatsApp 📱</h2>
                <p className="text-dark-gray/50 font-medium leading-relaxed">Let's connect your WhatsApp so I can help you send campaigns directly.</p>
              </div>
              
              <div className="bg-white p-10 rounded-card border-2 border-dashed border-dark-gray/10 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
                <div className="w-20 h-20 bg-whatsapp/10 text-whatsapp rounded-full flex items-center justify-center">
                  <ChevronRight size={40} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-dark-gray">WhatsApp Integration</h4>
                  <p className="text-sm text-dark-gray/40 font-medium">One-tap connection to your Business account</p>
                </div>
                <button className="px-8 py-3 bg-whatsapp text-white rounded-full font-bold shadow-lg shadow-whatsapp/20 active:scale-95 transition-all">
                  Connect Now
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center min-h-[50vh] gap-8"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-orange/10 rounded-full flex items-center justify-center animate-pulse">
                  <Loader2 size={48} className="animate-spin text-orange" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-brown leading-tight">Setting up your AI profile</h2>
                <p className="text-dark-gray/50 font-medium">Generating custom marketing ideas just for you...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <div className="py-3 md:py-4 bg-white/90 backdrop-blur-md border-t border-light-gray sticky bottom-0 w-full shrink-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <button 
            className={`w-full h-12 md:h-16 rounded-btn font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isInitializing ? 'bg-dark-gray/20 cursor-not-allowed' : 'bg-gradient-to-r from-orange to-yellow shadow-orange/30'
            }`}
            onClick={handleNext} 
            disabled={isInitializing}
          >
            {isInitializing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm md:text-base">Preparing AI...</span>
              </>
            ) : (
              <>
                <span className="text-sm md:text-lg">{step === 3 ? 'Get Started' : 'Continue'}</span>
                <ChevronRight size={20} className="md:w-6 md:h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
