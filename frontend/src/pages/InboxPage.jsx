import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UniversityBadge from '../components/common/UniversityBadge';
import ReportModal from '../components/common/ReportModal';
import { api } from '../api/client';
import { 
  Send, 
  ArrowLeft, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Check, 
  CheckCheck, 
  Flag,
  User as UserIcon 
} from 'lucide-react';

export default function InboxPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('with');
  const convoParam = searchParams.get('c');
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const chatScrollRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  if (!isAuthenticated) {
    navigate('/login?next=/inbox');
    return null;
  }

  // Load conversation list
  const loadConversations = async () => {
    try {
      const res = await api.get('/api/messages/conversations');
      setConversations(res.conversations || []);
      return res.conversations || [];
    } catch (err) {
      setConversations([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, []);

  // Determine active conversation when convoParam or targetUserId changes
  useEffect(() => {
    let mounted = true;
    async function resolveActiveChat() {
      if (!user) return;

      if (convoParam) {
        const found = conversations.find((c) => c._id === convoParam);
        if (found) {
          setActiveConvo(found);
          const partner = found.participants?.find((p) => p._id !== user._id);
          setActivePartner(partner || null);
          return;
        }
      }

      if (targetUserId) {
        try {
          const res = await api.post('/api/messages/conversations', { recipientId: targetUserId });
          if (mounted && res.conversation) {
            setActiveConvo(res.conversation);
            const partner = res.conversation.participants?.find((p) => p._id !== user._id);
            setActivePartner(partner || null);
          }
        } catch (_) {}
      } else {
        setActiveConvo(null);
        setActivePartner(null);
        setMessages([]);
      }
    }

    resolveActiveChat();
    return () => { mounted = false; };
  }, [convoParam, targetUserId, user, conversations.length]);

  // Poll messages and typing status for active conversation
  useEffect(() => {
    if (!activeConvo) return;
    let mounted = true;

    async function loadThread() {
      try {
        const res = await api.get(`/api/messages/${activeConvo._id}`);
        if (mounted) {
          setMessages(res.messages || []);
          setIsPartnerTyping(Boolean(res.isTyping));
        }
      } catch (_) {}
    }

    loadThread();
    const interval = setInterval(loadThread, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeConvo]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages.length, isPartnerTyping, activeConvo?._id]);

  // Handle typing notification
  const handleInputChange = (e) => {
    setNewText(e.target.value);
    if (!activeConvo) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      api.post(`/api/messages/${activeConvo._id}/typing`).catch(() => {});
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !activeConvo || sending) return;
    const textToSend = newText.trim();
    setNewText('');
    setSending(true);

    try {
      const res = await api.post(`/api/messages/${activeConvo._id}`, {
        text: textToSend,
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        loadConversations();
      }
    } catch (err) {
      alert('Could not send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (convo) => {
    const partner = convo.participants?.find((p) => p._id !== user._id);
    setActiveConvo(convo);
    setActivePartner(partner || null);
    setSearchParams({ c: convo._id, with: partner?._id || '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl overflow-hidden h-[75vh] flex">
        {/* Left Pane: Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-slate-200 dark:border-dark-border flex flex-col bg-slate-50/50 dark:bg-dark-surface/40 ${
            activeConvo ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              Messages &amp; Chats
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {conversations.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border/40">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const partner = conv.participants?.find((p) => p._id !== user._id) || {};
                const isSelected = activeConvo && activeConvo._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-brand-500/10 border-l-4 border-brand-500'
                        : 'hover:bg-slate-100/60 dark:hover:bg-dark-card'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 uppercase flex-shrink-0">
                      {partner.name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {partner.name || 'Peer'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <div className="mb-1">
                        <UniversityBadge user={partner} variant="compact" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {conv.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations yet. Reach out to a peer from the feed!
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-dark-card ${
            !activeConvo ? 'hidden md:flex items-center justify-center' : 'flex'
          }`}
        >
          {activeConvo && activePartner ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-surface/40">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveConvo(null);
                      setSearchParams({});
                    }}
                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-surface"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 uppercase">
                    {activePartner.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {activePartner.name}
                      </h3>
                      <UniversityBadge user={activePartner} variant="compact" />
                    </div>
                    <span className="text-[10.5px] font-mono text-slate-400">
                      {activePartner.department ? `${activePartner.department} · ` : ''}
                      {activePartner.universityName || 'Verified Peer'}
                    </span>
                  </div>
                </div>

                {/* Report User Button */}
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Report user"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Area */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const senderId = typeof m.sender === 'object' ? m.sender?._id : m.sender;
                  const isMe = String(senderId) === String(user?._id);
                  return (
                    <div
                      key={m._id || Math.random()}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                            : 'bg-slate-100 dark:bg-dark-surface text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-dark-border'
                        }`}
                      >
                        {m.text}
                      </div>

                      {/* Timestamp & Read/Seen Status */}
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-1 px-1">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          m.readAt ? (
                            <span className="text-emerald-500 flex items-center gap-0.5" title={`Seen at ${new Date(m.readAt).toLocaleTimeString()}`}>
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Seen</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5" title="Delivered">
                              <Check className="w-3 h-3" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Partner Typing Indicator Bubble */}
                {isPartnerTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic py-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                    <span>{activePartner.name || 'Peer'} is typing...</span>
                  </div>
                )}

              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 dark:border-dark-border flex items-center gap-2 bg-slate-50/50 dark:bg-dark-surface/40"
              >
                <input
                  type="text"
                  placeholder="Type your message to coordinate..."
                  value={newText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newText.trim() || sending}
                  className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 transition-all flex-shrink-0 shadow-sm shadow-brand-500/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-medium">Select a conversation to read and reply</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {activePartner && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetType="user"
          targetId={activePartner._id}
          targetTitle={activePartner.name}
        />
      )}
    </div>
  );
}
