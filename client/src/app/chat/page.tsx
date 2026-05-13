'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  type?: 'text' | 'suggestion';
  cardData?: any;
}

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [businessContext, setBusinessContext] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: "Good morning! ☀️\nHow's business today?",
      timestamp: '9:15 AM'
    },
    {
      id: '2',
      sender: 'ai',
      text: "Good morning! 🌞\n\nToday's suggestion:\nPost your mango cake with this...",
      timestamp: '9:16 AM'
    },
    {
      id: '3',
      sender: 'ai',
      text: "Here is your suggestion:",
      timestamp: '9:16 AM',
      type: 'suggestion',
      cardData: {
        image: "Fresh Mango Cake 🥭",
        caption: "Just out of the oven! Limited portions available...",
        hashtags: "#mangocake #homemade #freshbaking",
        imageUrl: "https://loremflickr.com/400/300/cake,dessert?lock=3"
      }
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load business context from onboarding
    const ctx = localStorage.getItem('businessContext');
    let parsedCtx = null;
    if (ctx) {
      try {
        parsedCtx = JSON.parse(ctx);
        setBusinessContext(parsedCtx);
      } catch (e) {}
    }

    // Load initial chat data if coming directly from onboarding
    const initialDataStr = localStorage.getItem('initialChatData');
    if (initialDataStr) {
      try {
        const initialData = JSON.parse(initialDataStr);
        const aiMessageId = Date.now().toString();
        const aiMessage: Message = {
          id: aiMessageId,
          sender: 'ai',
          text: initialData.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: initialData.type,
          cardData: initialData.cardData
        };

        if (aiMessage.type === 'suggestion' && aiMessage.cardData) {
           const keywords = parsedCtx?.product ? encodeURIComponent(parsedCtx.product.split(' ')[0]) : 'product';
           aiMessage.cardData.imageUrl = `https://loremflickr.com/400/300/${keywords},sale?lock=${aiMessageId}`;
        }

        setMessages([aiMessage]);
        localStorage.removeItem('initialChatData');
      } catch (e) {}
    }
  }, []);

  const handleAction = (action: string, msg: Message) => {
    if (action === 'edit' || action === 'schedule' || action === 'approve') {
      // Save the specific card data to local storage for the preview screen
      if (msg.cardData) {
        localStorage.setItem('previewData', JSON.stringify(msg.cardData));
      }
      router.push('/preview');
    } else {
      alert(`Action: ${action}`);
    }
  };

  const handleMenu = () => {
    router.push('/dashboard');
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          context: businessContext
        })
      });
      const resData = await response.json();

      if (resData.success && resData.data) {
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
          id: aiMessageId,
          sender: 'ai',
          text: resData.data.text,
          timestamp: new Date(resData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: resData.data.type,
          cardData: resData.data.cardData
        };

        // If it's a suggestion, append an image URL
        if (aiMessage.type === 'suggestion' && aiMessage.cardData) {
           const keywords = businessContext?.product ? encodeURIComponent(businessContext.product.split(' ')[0]) : 'product';
           aiMessage.cardData.imageUrl = `https://loremflickr.com/400/300/${keywords},sale?lock=${aiMessageId}`;
        }

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className={styles.chatMain}>
      <header className={styles.header}>
        <div className={styles.menuIcon} onClick={handleMenu}>&#9776;</div>
        <div className={styles.title}>Orders-First AI</div>
        <div className={styles.headerActions}>
          <span className={styles.icon}>🔔</span>
          <span className={styles.icon}>⚙️</span>
        </div>
      </header>

      <div className={styles.chatContainer}>
        {messages.map(msg => (
          msg.sender === 'user' ? (
            <div key={msg.id} className={styles.messageRowRight}>
              <div className={styles.messageBubbleUser}>
                {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
              <span className={styles.timestamp}>{msg.timestamp}</span>
            </div>
          ) : (
            <div key={msg.id} className={styles.messageRowLeft}>
              <span className={styles.timestamp}>{msg.timestamp}</span>
              {msg.text && (
                <div className={styles.messageBubbleAi}>
                  {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              )}
              {msg.type === 'suggestion' && msg.cardData && (
                <div className={styles.suggestionCard}>
                  <div 
                    className={styles.imagePreview} 
                    style={{ backgroundImage: `url(${msg.cardData.imageUrl})` }}
                  >
                  </div>
                  <div className={styles.cardContent}>
                    <h4>{msg.cardData.image}</h4>
                    <p className="body-regular">{msg.cardData.caption}</p>
                    <p className="body-small" style={{ color: 'var(--color-orange)' }}>{msg.cardData.hashtags}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => handleAction('approve', msg)}>Approve</button>
                    <button className={styles.actionBtn} onClick={() => handleAction('edit', msg)}>Edit</button>
                    <button className={styles.actionBtn} onClick={() => handleAction('schedule', msg)}>Schedule</button>
                  </div>
                </div>
              )}
            </div>
          )
        ))}
        {isTyping && (
          <div className={styles.messageRowLeft}>
             <div className={styles.messageBubbleAi} style={{ fontStyle: 'italic', color: '#888' }}>
               AI is typing...
             </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <span className={styles.inputIcon}>💬</span>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
      </div>
    </main>
  );
}
