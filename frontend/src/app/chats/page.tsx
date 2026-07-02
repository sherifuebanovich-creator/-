'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { socialApi, chatApi } from '@/lib/api';
import { getSocket } from '@/hooks/useSocket';
import { Group, CityChatMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaUsers, FaSearch, FaPlus, FaPaperPlane, FaCity } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/i18n';

export default function ChatsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'city' | 'groups'>('city');

  return (
    <div className="min-h-dvh bg-dark-bg pb-safe-bottom">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary-900/30 to-transparent" />
      </div>
      <div className="relative px-4 pt-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-all">
            <FaArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-black text-white font-display flex-1">{t('chats.title')}</h1>
          <button onClick={() => router.push('/chats/create-group')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-all">
            <FaPlus size={12} /> {t('chats.create')}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-sm" placeholder={t('chats.searchGroups')} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('city')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === 'city' ? 'bg-primary-600/30 text-primary-400 border border-primary-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>
            <FaCity size={12} /> {t('chats.cityChat')}
          </button>
          <button onClick={() => setTab('groups')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${tab === 'groups' ? 'bg-primary-600/30 text-primary-400 border border-primary-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}>
            <FaUsers size={12} /> {t('chats.groups')}
          </button>
        </div>

        {tab === 'city' ? <CityChatSection /> : <GroupsListSection searchQuery={searchQuery} />}
      </div>
    </div>
  );
}

function CityChatSection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const userCity = user?.city || user?.homeAddress || '';
  const [messages, setMessages] = useState<CityChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cityName = userCity.split(',')[0].trim() || 'unknown';
  const wsJoined = useRef(false);
  const prevCityRef = useRef('');

  const socket = getSocket();

  const joinCityRoom = useCallback(() => {
    if (!socket?.connected || !cityName || cityName === 'unknown' || wsJoined.current) return;
    socket.emit('city:join', { city: cityName });
    wsJoined.current = true;
  }, [socket, cityName]);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {
      wsJoined.current = false;
      if (cityName && cityName !== 'unknown') {
        chatApi.getCityMessages(cityName).then(res => {
          const data = res.data?.data || res.data;
          setMessages(data?.messages || data || []);
        }).catch(() => {});
      }
    };
    socket.on('connect', onConnect);
    return () => { socket.off('connect', onConnect); };
  }, [socket, cityName]);

  useEffect(() => {
    if (!cityName || cityName === 'unknown') {
      setLoading(false);
      return;
    }

    const prevCity = prevCityRef.current;
    if (prevCity && prevCity !== cityName) {
      socket?.emit('city:leave', { city: prevCity });
      wsJoined.current = false;
    }
    prevCityRef.current = cityName;

    setLoading(true);
    joinCityRoom();

    chatApi.getCityMessages(cityName).then(res => {
      const data = res.data?.data || res.data;
      setMessages(data?.messages || data || []);
    }).catch(() => {
      setMessages([]);
    }).finally(() => setLoading(false));

    const onMessage = (msg: CityChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    socket?.on('city:message', onMessage);
    return () => {
      socket?.off('city:message', onMessage);
    };
  }, [cityName, socket, joinCityRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!socket?.connected) {
      toast.error(t('chats.noConnection'));
      return;
    }
    socket.emit('city:message', { city: cityName, content: input.trim() });
    setInput('');
  };

  if (!userCity) {
    return (
      <div className="card p-6 text-center">
        <FaCity size={24} className="text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">{t('chats.setCity')}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <FaCity size={14} className="text-primary-400" />
        <span className="text-sm text-white font-medium">{t('chats.cityChatName', { city: cityName })}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">{t('chats.noMessages')}</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.userId === user?.id ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white/10 text-gray-200 rounded-bl-md'}`}>
                {msg.userId !== user?.id && (
                  <p className="text-[10px] text-primary-300 font-medium mb-1">{msg.user?.displayName}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-[10px] opacity-50 text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="input-field flex-1 text-sm" placeholder={t('chats.messagePlaceholder')} />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-all disabled:opacity-50">
            <FaPaperPlane size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function GroupsListSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const searchFetchId = useRef(0);

  useEffect(() => {
    Promise.all([
      socialApi.getGroups(1, undefined, undefined, ''),
      socialApi.getMyGroups(),
    ]).then(([gRes, mRes]) => {
      const gData = gRes.data?.data || gRes.data;
      const mData = mRes.data?.data || mRes.data;
      const loaded: Group[] = gData?.groups || gData || [];
      setAllGroups(loaded);
      setGroups(loaded);
      setMyGroups(mData || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setGroups(allGroups);
      return;
    }
    const thisId = ++searchFetchId.current;
    socialApi.searchGroups(searchQuery).then(res => {
      if (thisId !== searchFetchId.current) return;
      const data = res.data?.data || res.data;
      setGroups(data || []);
    }).catch(() => {});
  }, [searchQuery, allGroups]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((group, idx) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="card p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover rounded-2xl" /> : <FaUsers size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{group.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {t('chats.members', { count: group.memberCount })}{group.city ? ` · ${group.city}` : ''}
                {group.owner && ` · ${group.owner.displayName}`}
              </p>
            </div>
            {myGroups.some(mg => mg.id === group.id) && (
              <span className="text-[10px] font-medium text-primary-400 bg-primary-600/20 px-2 py-1 rounded-lg">Вступили</span>
            )}
          </motion.div>
        </Link>
      ))}
      {groups.length === 0 && (
        <div className="card p-6 text-center">
          <FaUsers size={24} className="text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">{searchQuery ? t('chats.groupsNotFound') : t('chats.noGroups')}</p>
        </div>
      )}
    </div>
  );
}
