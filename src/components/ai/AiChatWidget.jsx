import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader, Sparkles, ShoppingBag } from 'lucide-react';
import { api } from '../../api/index';
import { Link } from 'react-router-dom';

// ─── Types (JSDoc) ───────────────────────────────────────────
/**
 * @typedef {{ role: 'user'|'assistant', content: string, ts: number }} Message
 */

// ─── Suggested starter questions ────────────────────────────
const STARTERS = [
  "What's good for a wedding aso-ebi?",
  "Show me Guinea Brocade options",
  "Fabric for a casual agbada?",
  "Budget ₦5,000 per yard — what do you have?",
];

// ─── Main component ──────────────────────────────────────────
export default function AiChatWidget() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [aiEnabled, setAiEnabled] = useState(null); // null = unchecked
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);
  const hasFetchedStatus          = useRef(false);

  // Check if AI is configured on first open
  useEffect(() => {
    if (!open || hasFetchedStatus.current) return;
    hasFetchedStatus.current = true;
    api.get('/ai/status')
      .then(r => setAiEnabled(r.data.enabled))
      .catch(() => setAiEnabled(false));
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const content = (text !== undefined ? text : input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content, ts: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        history: newHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
        message: content,
      });
      setMessages(h => [...h, { role: 'assistant', content: data.reply, ts: Date.now() }]);
    } catch {
      setMessages(h => [...h, {
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Please try again!",
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI shopping assistant"
        className="fixed bottom-6 right-6 z-[500] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(201,168,76,0.4)] hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)' }}
        animate={open ? { rotate: 90, scale: 0.95 } : { rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {open
          ? <X size={22} color="#080808" strokeWidth={2.5} />
          : <MessageCircle size={22} color="#080808" strokeWidth={2} />
        }
      </motion.button>

      {/* ── Unread dot (pulsing when closed and no messages yet) ── */}
      {!open && isEmpty && (
        <motion.div
          className="fixed bottom-[68px] right-5 z-[501] w-3 h-3 rounded-full bg-[#c9a84c]"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
      )}

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-24 right-6 z-[499] w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.6)] border border-[var(--border)]"
            style={{ height: 520, background: 'var(--bg-2)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]"
              style={{ background: 'linear-gradient(135deg,rgba(40,28,0,0.95),rgba(26,18,0,0.95))' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c97a)' }}>
                <Sparkles size={17} color="#080808" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-white leading-tight">Amara</div>
                <div className="text-[11px] text-[#c9a84c] tracking-wide">LUMNG Fabric Assistant</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              style={{ scrollbarWidth: 'thin' }}>

              {isEmpty && (
                <div className="flex flex-col gap-4 h-full justify-between">
                  {/* Welcome */}
                  <div>
                    <div className="flex gap-2 mb-3">
                      <AvatarDot />
                      <Bubble role="assistant">
                        Hello! I'm Amara, your LUMNG fabric assistant 🌍{'\n\n'}
                        Tell me about the occasion, your budget, or what fabric you're looking for — I'll find the perfect match from our collection.
                      </Bubble>
                    </div>
                  </div>

                  {/* Starter chips */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider px-1">Quick questions:</p>
                    {STARTERS.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-left text-[13px] text-[var(--text-dim)] bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 hover:border-[var(--gold-dim)] hover:text-[var(--gold-light)] transition-all">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={m.ts}
                  className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'assistant' && <AvatarDot />}
                  <Bubble role={m.role}>{m.content}</Bubble>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <AvatarDot />
                  <div className="flex items-center gap-1.5 bg-[var(--bg-3)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Shop link row */}
            <div className="px-4 py-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-ghost)]">Powered by GPT-4o mini</span>
              <Link to="/shop" onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-[11px] text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors uppercase tracking-wider">
                <ShoppingBag size={11} /> Browse Shop
              </Link>
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] bg-[var(--bg-2)]">
              <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus-within:border-[var(--gold-dim)] transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about fabrics, occasions, budget…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-[var(--text)] text-[14px] placeholder:text-[var(--text-ghost)] outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#c9a84c,#e8c97a)' : 'transparent' }}
                >
                  {loading
                    ? <Loader size={15} className="animate-spin text-[var(--text-muted)]" />
                    : <Send size={14} color={input.trim() ? '#080808' : 'currentColor'} strokeWidth={2} />
                  }
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────
function AvatarDot() {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-1"
      style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c97a)' }}>
      <Sparkles size={12} color="#080808" />
    </div>
  );
}

function Bubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div
      className={`max-w-[82%] text-[13px] leading-relaxed whitespace-pre-wrap rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-gradient-to-br from-[var(--gold)] to-[var(--gold-light)] text-[#080808] rounded-tr-sm font-medium'
          : 'bg-[var(--bg-3)] border border-[var(--border)] text-[var(--text-dim)] rounded-tl-sm'
      }`}
    >
      {children}
    </div>
  );
}

function TypingDots() {
  return (
    <>
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--gold)]"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
