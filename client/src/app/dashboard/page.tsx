'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, TrendingUp, Lightbulb, Zap, Loader2 } from 'lucide-react';

export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/analytics');
        const resData = await res.json();
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen w-full flex flex-col relative bg-cream">
      <header className="h-16 bg-white/90 backdrop-blur-sm shadow-sm z-10 w-full shrink-0 flex items-center justify-center border-b border-black/5">
        <div className="w-full max-w-3xl px-4 md:px-6 h-full flex items-center justify-between">
          <button onClick={() => router.push('/chat')} className="flex items-center gap-2 p-2 hover:bg-black/5 rounded-full transition-colors -ml-2">
            <ArrowLeft size={20} className="text-dark-gray" />
            <span className="font-bold text-brown">Dashboard</span>
          </button>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors -mr-2">
            <Settings size={20} className="text-dark-gray" />
          </button>
        </div>
      </header>

      <div className="w-full py-6 pb-12 flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 md:px-6 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-orange" />
            <p className="text-sm font-medium text-dark-gray/40">Loading analytics...</p>
          </div>
        ) : data ? (
          <>
             <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-orange" />
                <h3 className="text-lg font-bold text-brown">This Week</h3>
              </div>
              
              <div className="w-full bg-white rounded-2xl shadow-md py-8 px-8 md:py-10 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 overflow-hidden">
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-orange">{data.posts_suggested}</span>
                  <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-wider">Posts Suggested</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-orange">{data.posts_approved}</span>
                  <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-wider">Approved & Posted</p>
                </div>
                <div className="space-y-1 md:border-l md:border-light-gray md:pl-4">
                  <span className="text-2xl font-bold text-orange">{data.orders_count}</span>
                  <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-wider flex items-center gap-1">Orders Received 🎉</p>
                </div>
                <div className="space-y-1 md:border-l md:border-light-gray md:pl-4">
                  <span className="text-2xl font-bold text-orange">₹{data.revenue.toLocaleString()}</span>
                  <p className="text-[10px] font-bold text-dark-gray/40 uppercase tracking-wider flex items-center gap-1">Revenue 💰</p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow" />
                <h3 className="text-lg font-bold text-brown">What's Working</h3>
              </div>
              <div className="w-full bg-white rounded-2xl shadow-md py-8 px-10 pl-12 md:py-10 md:px-12 md:pl-14 border-l-4 border-yellow overflow-hidden">
                <ul className="flex flex-col gap-3">
                  {data.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="text-sm text-dark-gray leading-snug flex items-start gap-3 italic">
                      <span className="text-yellow font-bold shrink-0">•</span>
                      <span className="flex-1">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-info" />
                <h3 className="text-lg font-bold text-brown">Next Best Action</h3>
              </div>
              <div className="w-full bg-white rounded-2xl shadow-md py-8 px-10 pl-12 pb-10 md:py-10 md:px-12 md:pl-14 md:pb-12 border-l-4 border-info flex flex-col gap-4 overflow-hidden">
                <p className="text-sm font-medium text-dark-gray leading-relaxed">{data.next_action.text}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-dark-gray/40 uppercase tracking-wider">{data.next_action.action}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert('Action Started')}
                      className="px-6 py-2 bg-info text-white text-xs font-bold rounded-full shadow-md shadow-info/20 active:scale-95 transition-all"
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => alert('Skipped')}
                      className="px-6 py-2 bg-light-gray text-dark-gray/60 text-xs font-bold rounded-full active:scale-95 transition-all"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </>
        ) : (
          <div className="text-center py-20 text-dark-gray/40 font-medium">Failed to load data.</div>
        )}
        </div>
      </div>
    </main>
  );
}
