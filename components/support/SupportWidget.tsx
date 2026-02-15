'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, X, HelpCircle, Mail } from 'lucide-react';
import ApiService from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_PROMPTS = [
  'Where is my order?',
  'How do I change my address?',
  'I need a refund',
];

type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  text: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export default function SupportWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'ticket'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    ApiService.getFaqs(true).then((data) => setFaqs(data || []));
  }, []);

  const topFaqs = useMemo(() => faqs.slice(0, 3), [faqs]);

  const canSend = useMemo(() => {
    if (!input.trim()) return false;
    if (user) return true;
    return guestName.trim().length > 1 && guestEmail.trim().length > 3;
  }, [input, user, guestName, guestEmail]);

  const appendMessage = (role: 'user' | 'bot', text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, text },
    ]);
  };

  const handleSend = async () => {
    if (!canSend || loading) return;
    const text = input.trim();
    setInput('');
    appendMessage('user', text);

    try {
      setLoading(true);
      let currentTicketId = ticketId;
      if (!currentTicketId) {
        const created = await ApiService.createSupportTicket({
          user_id: user?.id || null,
          user_name: user ? (user.email ? user.email.split('@')[0] : 'User') : null,
          user_email: user?.email || null,
          guest_name: user ? null : guestName.trim(),
          guest_email: user ? null : guestEmail.trim(),
          subject: 'Chat Support',
          message: text,
          category: 'General',
          priority: 'normal'
        });
        currentTicketId = created?.id || null;
        setTicketId(currentTicketId);
      } else {
        await ApiService.createSupportMessage(currentTicketId, {
          sender_role: user ? 'user' : 'guest',
          message: text
        });
      }

      const faqMatch = faqs.find((faq) =>
        faq.question.toLowerCase().includes(text.toLowerCase())
      );
      const reply = faqMatch
        ? faqMatch.answer
        : 'Thanks! Our support team will respond shortly. You can also submit a full request on the Support page.';
      appendMessage('bot', reply);
    } catch (error) {
      appendMessage('bot', 'Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#173A00] text-white shadow-lg shadow-[#173A00]/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
        aria-label="Open support chat"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
      </button>

      {open && (
        <div className="fixed bottom-3 right-3 z-50 w-[88vw] max-w-[18rem] sm:bottom-6 sm:right-6 sm:w-[86vw] sm:max-w-sm md:max-w-xs rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-4 py-3.5 border-b bg-gradient-to-r from-[#173A00] to-[#1f4b00] text-white">
            <div>
              <div className="text-sm font-semibold">Support</div>
              <div className="text-xs text-white/80">We usually reply in a few minutes</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition"
              aria-label="Close support"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 px-4 py-2.5 bg-white">
            <button
              className={`flex-1 rounded-full px-3 py-1 text-xs font-medium ${
                activeView === 'chat'
                  ? 'bg-[#173A00] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView('chat')}
            >
              Chat
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-1 text-xs font-medium ${
                activeView === 'ticket'
                  ? 'bg-[#173A00] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveView('ticket')}
            >
              Create Ticket
            </button>
          </div>

          {activeView === 'chat' ? (
            <div className="px-4 pb-4">
              {!user && (
                <div className="mb-3 rounded-lg bg-gray-50/80 border border-gray-200 p-3 text-xs text-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span>Guest details</span>
                  </div>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Your name"
                    className="mb-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#173A00]"
                  />
                  <input
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Email for updates"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#173A00]"
                  />
                </div>
              )}

              <div className="space-y-2.5 max-h-40 sm:max-h-56 overflow-y-auto rounded-xl bg-gray-50 p-3">
                {messages.length === 0 && (
                  <div className="text-xs text-gray-500 space-y-2.5">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <HelpCircle className="h-4 w-4" />
                      Quick help
                    </div>
                    {DEFAULT_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs hover:border-[#173A00] hover:shadow-sm transition"
                      >
                        {prompt}
                      </button>
                    ))}
                    {topFaqs.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] uppercase text-gray-400">Top FAQs</div>
                        {topFaqs.map((faq) => (
                          <div key={faq.id} className="mt-1 text-xs text-gray-600">
                            {faq.question}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'ml-auto bg-[#173A00] text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#173A00]"
                />
                <button
                  onClick={handleSend}
                  disabled={!canSend || loading}
                  className="h-9 w-9 rounded-full bg-[#173A00] text-white flex items-center justify-center disabled:opacity-50 shadow-sm hover:shadow-md transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-4 text-xs text-gray-600">
                Need more help? Use the full Support page to submit detailed requests, upload files, and track status.
              </div>
              <a
                href="/support"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#173A00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md transition"
              >
                Go to Support Page
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
