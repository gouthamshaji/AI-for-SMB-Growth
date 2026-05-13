'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

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
    } else {
      router.push('/chat');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('businessContext', JSON.stringify(formData));
    router.push('/chat');
  };

  return (
    <main className={styles.onboardingMain}>
      <header className={styles.header}>
        <div className={styles.backButton}>&larr;</div>
        <div className={styles.stepIndicator}>Step {step} of 3</div>
        <div className={styles.skipButton} onClick={handleSkip}>Skip</div>
      </header>

      <div className={styles.content}>
        <h2>Tell me about your business 🏠</h2>

        {step === 1 && (
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <label>What do you sell?</label>
              <input 
                className="input-field" 
                placeholder="e.g. Homemade chocolates" 
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>Where are you located?</label>
              <input 
                className="input-field" 
                placeholder="e.g. Pune, Maharashtra" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className={styles.inputWrapper}>
              <label>What's your average order value?</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input type="radio" name="aov" value="under500" 
                    checked={formData.orderValue === 'under500'}
                    onChange={() => setFormData({...formData, orderValue: 'under500'})}
                  />
                  <span>Under ₹500</span>
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="aov" value="500-1000"
                    checked={formData.orderValue === '500-1000'}
                    onChange={() => setFormData({...formData, orderValue: '500-1000'})}
                  />
                  <span>₹500 - ₹1,000</span>
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="aov" value="1000-2000"
                    checked={formData.orderValue === '1000-2000'}
                    onChange={() => setFormData({...formData, orderValue: '1000-2000'})}
                  />
                  <span>₹1,000 - ₹2,000</span>
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="aov" value="above2000"
                    checked={formData.orderValue === 'above2000'}
                    onChange={() => setFormData({...formData, orderValue: 'above2000'})}
                  />
                  <span>Above ₹2,000</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formGroup}>
            <p className="body-large">Let's connect your WhatsApp so I can help you send campaigns directly.</p>
            {/* Mocking step 2 */}
            <div className={styles.mockBox}>WhatsApp Connection Integration Placeholder</div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.formGroup}>
            <p className="body-large">Setting up your AI profile. This takes just a moment...</p>
             <div className={styles.mockBox} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <span className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Generating custom ideas...
             </div>
          </div>
        )}

      </div>

      <div className={styles.footer}>
        <button className="btn-primary" onClick={handleNext} disabled={isInitializing}>
          {isInitializing ? 'Preparing AI...' : 'Next \u2192'}
        </button>
      </div>
    </main>
  );
}
