'use client'

import { useEffect, useState, useRef, Suspense } from 'react' // Ajout de Suspense
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, ChatConversation, ChatMessage } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Send, User, Check, CheckCheck, Search, Paperclip, MessageSquare } from 'lucide-react'

// --- Types ---
interface ConversationWithUser extends ChatConversation {
  profiles?: {
    full_name: string
    email: string
    avatar_url: string
  }
  unread_count?: number
}

// --- Composant Principal avec la logique ---
function ChatInterface() {
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    checkAdmin()
  }, [])

  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId')
    if (chatIdFromUrl && conversations.length > 0 && !selectedConversation) {
      const convToRestore = conversations.find(c => c.id === chatIdFromUrl)
      if (convToRestore) setSelectedConversation(convToRestore)
    }
  }, [conversations, searchParams])

  useEffect(() => {
    if (user && selectedConversation) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('chatId', selectedConversation.id)
      window.history.pushState({}, '', newUrl)
      loadMessages()
      const unsubscribe = subscribeToMessages()
      markMessagesAsRead()
      return () => { if (unsubscribe) unsubscribe() }
    }
  }, [user, selectedConversation])

  useEffect(() => { scrollToBottom() }, [messages])

  const checkAdmin = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) { router.push('/login'); return; }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', currentUser.id).single()
    if (!profile?.is_admin) { router.push('/home'); return; }
    setUser(currentUser)
    loadConversations(currentUser.id)
  }

  const loadConversations = async (currentUserId?: string) => {
    const activeUserId = currentUserId || user?.id
    if (!activeUserId) return
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`*, profiles!chat_conversations_user_id_fkey (full_name, email, avatar_url)`)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
      if (error) throw error
      const validData = (data || []).filter(conv => conv !== null && conv.id)
      const uniqueConversationsMap = new Map()
      validData.forEach((conv: any) => {
        if (conv.profiles && !uniqueConversationsMap.has(conv.user_id)) {
          uniqueConversationsMap.set(conv.user_id, conv)
        }
      })
      const uniqueConversations = Array.from(uniqueConversationsMap.values()) as ConversationWithUser[]
      const conversationsWithUnread = await Promise.all(
        uniqueConversations.map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', activeUserId)
          return { ...conv, unread_count: count || 0 }
        })
      )
      setConversations(conversationsWithUnread)
    } catch (error) { console.error('Error:', error) } finally { setLoading(false) }
  }

  const loadMessages = async () => {
    if (!selectedConversation) return
    try {
      const { data, error } = await supabase.from('chat_messages').select('*').eq('conversation_id', selectedConversation.id).order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data || [])
    } catch (error) { console.error('Error loading messages:', error) }
  }

  const subscribeToMessages = () => {
    if (!selectedConversation || !user) return
    const channel = supabase.channel(`admin-chat:${selectedConversation.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages((current) => [...current, newMessage])
          if (newMessage.sender_id !== user.id) markMessageAsRead(newMessage.id)
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !user) return
    try {
      await supabase.from('chat_messages').update({ is_read: true }).eq('conversation_id', selectedConversation.id).neq('sender_id', user.id).eq('is_read', false)
      loadConversations()
    } catch (error) { console.error('Error:', error) }
  }

  const markMessageAsRead = async (messageId: string) => {
    try { await supabase.from('chat_messages').update({ is_read: true }).eq('id', messageId) } catch (error) { console.error('Error:', error) }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('chat-images').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(fileName)
      await sendMessage(publicUrl, 'image')
    } catch (error: any) { alert(`Erreur: ${error.message}`) } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const sendMessage = async (contentOverride?: string, type: 'text' | 'image' = 'text') => {
    const contentToSend = contentOverride || newMessage
    if (!contentToSend.trim() || !user || !selectedConversation) return
    setSending(true)
    try {
      const { error } = await supabase.from('chat_messages').insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          message_type: type,
          content: type === 'text' ? contentToSend : 'Image envoyée',
          file_url: type === 'image' ? contentToSend : null,
          is_read: false
        })
      if (error) throw error
      await supabase.from('chat_conversations').update({ last_message_at: new Date().toISOString(), admin_id: user.id }).eq('id', selectedConversation.id)
      if (type === 'text') setNewMessage('')
      loadConversations()
    } catch (error) { alert('Failed to send message') } finally { setSending(false) }
  }

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  const formatTime = (timestamp: string) => { return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }

  const filteredConversations = conversations.filter(conv =>
    conv.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
            <div>
                <h1 className={`text-3xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    SUPPORT <span className="text-brand-primary">DASHBOARD</span>
                </h1>
                <p className="text-sm opacity-60">Gestion des conversations clients en temps réel</p>
            </div>
            <div className={`px-4 py-2 rounded-xl border border-brand-primary/20 bg-brand-primary/5 text-brand-primary font-bold text-sm flex items-center gap-2`}>
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                ADMIN CONNECTÉ
            </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Liste des Conversations (4 cols) */}
          <div className={`lg:col-span-4 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} rounded-3xl border shadow-sm flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-inherit">
              <div className="relative group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-brand-primary' : 'text-gray-400 group-focus-within:text-brand-primary'}`} size={18} />
                <input
                  type="text"
                  placeholder="Chercher un client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all outline-none ${theme === 'dark' ? 'bg-gray-800 focus:bg-gray-700' : 'bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-primary/20'}`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <MessageSquare size={48} className="mb-2" />
                  <p className="text-sm">Aucun chat trouvé</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-inherit cursor-pointer transition-all relative ${
                      selectedConversation?.id === conv.id
                        ? theme === 'dark' ? 'bg-brand-primary/10' : 'bg-brand-primary/5'
                        : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                  >
                    {selectedConversation?.id === conv.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
                    )}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {conv.profiles?.avatar_url ? (
                          <img src={conv.profiles.avatar_url} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-primary/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <User size={24} />
                          </div>
                        )}
                        {(conv.unread_count || 0) > 0 && (
                          <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-bounce">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {conv.profiles?.full_name || 'Utilisateur'}
                        </p>
                        <p className={`text-xs truncate opacity-50`}>
                          {conv.profiles?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de Chat (8 cols) */}
          <div className={`lg:col-span-8 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} rounded-3xl border shadow-sm flex flex-col overflow-hidden`}>
            {selectedConversation ? (
              <>
                <div className={`p-4 border-b border-inherit flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="font-black text-lg">
                        {selectedConversation.profiles?.full_name}
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-primary/5">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id
                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md`}>
                          <div className={`rounded-3xl px-5 py-3 shadow-sm ${
                            isOwn 
                                ? 'bg-brand-primary text-white' 
                                : theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                          }`}>
                            {message.message_type === 'image' && message.file_url ? (
                              <img 
                                src={message.file_url} 
                                alt="Shared image" 
                                className="rounded-xl max-h-64 object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                                onClick={() => message.file_url && window.open(message.file_url, '_blank')}
                              />
                            ) : (
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 mt-2 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] opacity-40 font-bold">{formatTime(message.created_at)}</span>
                            {isOwn && (
                              message.is_read 
                                ? <CheckCheck size={14} className="text-brand-primary" /> 
                                : <Check size={14} className="opacity-30" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className={`p-4 bg-inherit border-t border-inherit`}>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending || uploading}
                      className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} text-brand-primary`}
                    >
                      {uploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div> : <Paperclip size={22} />}
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(undefined, 'text')}
                      placeholder="Répondre au client..."
                      className={`flex-1 px-5 py-3 rounded-2xl outline-none transition-all ${theme === 'dark' ? 'bg-gray-800 focus:bg-gray-700' : 'bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-primary/20'}`}
                    />
                    
                    <button
                      onClick={() => sendMessage(undefined, 'text')}
                      disabled={sending || (!newMessage.trim() && !uploading)}
                      className="p-4 bg-brand-primary text-white rounded-2xl hover:bg-brand-accent transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                    >
                      {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-12">
                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare size={48} className="text-brand-primary" />
                </div>
                <h2 className="text-xl font-black">SUPPORT DASHBOARD</h2>
                <p className="max-w-xs text-sm">Veuillez sélectionner une conversation pour commencer l'assistance client.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// --- Export par défaut avec Suspense pour fixer l'erreur de build ---
export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white italic text-gray-400">Loading Support Interface...</div>}>
      <ChatInterface />
    </Suspense>
  )
}