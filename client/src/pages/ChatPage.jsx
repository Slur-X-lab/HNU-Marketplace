import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const { id: convId } = useParams();
  const { user } = useAuth();
  const { socket, fetchUnreadCount, clearUnread } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // mobile toggle
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    axios.get('/api/chat/conversations').then(r => {
      setConversations(r.data);
      clearUnread();
      if (convId) {
        const found = r.data.find(c => c.id == convId);
        if (found) {
          setActiveConv(found);
          setShowSidebar(false); // auto-open chat on mobile
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    navigate(`/chat/${activeConv.id}`, { replace: true });
    axios.get(`/api/chat/conversations/${activeConv.id}/messages`).then(r => {
      setMessages(r.data);
    });
    if (socket) socket.emit('join_conversation', activeConv.id);
    return () => { if (socket) socket.emit('leave_conversation', activeConv?.id); };
  }, [activeConv?.id]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (msg.conversation_id == activeConv?.id) {
        setMessages(prev => [...prev, msg]);
      }
      setConversations(prev => prev.map(c =>
        c.id == msg.conversation_id
          ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
          : c
      ));
    });
    socket.on('user_typing', ({ name }) => setOtherTyping(name));
    socket.on('user_stop_typing', () => setOtherTyping(false));
    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleSend = () => {
    if (!text.trim() || !activeConv) return;
    socket?.emit('send_message', { conversationId: activeConv.id, content: text.trim() });
    socket?.emit('stop_typing', { conversationId: activeConv.id });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !activeConv) return;
    socket.emit('typing', { conversationId: activeConv.id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv.id });
    }, 1500);
  };

  const getOtherUser = (conv) => conv?.buyer_id === user.id
    ? { name: conv.seller_name }
    : { name: conv.buyer_name };

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setShowSidebar(false); // hide sidebar on mobile when chat selected
  };

  const handleBack = () => {
    setShowSidebar(true); // show sidebar again on mobile
    setActiveConv(null);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-56px)] flex overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      {/* On mobile: full width when showSidebar, hidden when in chat */}
      {/* On desktop: always visible fixed width */}
      <div className={`
        ${showSidebar ? 'flex' : 'hidden'} md:flex
        w-full md:w-72 border-r border-gray-100 bg-white flex-col shrink-0
      `}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-base">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No conversations yet</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherUser(conv);
            const isActive = activeConv?.id === conv.id;
            return (
              <button key={conv.id} onClick={() => handleSelectConv(conv)}
                className={`w-full text-left px-4 py-3.5 flex gap-3 items-start transition-colors border-b border-gray-50 border-l-4 ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50 border-l-transparent'
                }`}
                style={isActive ? { borderLeftColor: '#00ab41' } : {}}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: '#00ab41' }}>
                  {other.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{other.name}</p>
                    {conv.unread_count > 0 && (
                      <span className="text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0"
                        style={{ background: '#00ab41' }}>
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.product_title && (
                    <p className="text-[11px] truncate font-medium" style={{ color: '#00ab41' }}>
                      {conv.product_title}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      {/* On mobile: full width when !showSidebar, hidden when sidebar is shown */}
      <div className={`
        ${!showSidebar ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col overflow-hidden
      `} style={{ background: '#f0faf4' }}>

        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              {/* Back button — mobile only */}
              <button onClick={handleBack}
                className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-1">
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: '#00ab41' }}>
                {getOtherUser(activeConv).name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{getOtherUser(activeConv).name}</p>
                {activeConv.product_title && (
                  <p className="text-xs" style={{ color: '#00ab41' }}>Re: {activeConv.product_title}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No messages yet. Say hi! 👋</p>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMine ? 'text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm'
                    }`} style={isMine ? { background: '#00ab41' } : {}}>
                      <p className="leading-relaxed break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {otherTyping && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 items-center">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                placeholder="Type a message..."
                value={text}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                onFocus={e => e.target.style.borderColor = '#00ab41'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button onClick={handleSend} disabled={!text.trim()}
                className="text-white p-2.5 rounded-xl transition-all disabled:opacity-40 active:scale-95 shrink-0"
                style={{ background: '#00ab41' }}>
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
