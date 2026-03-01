'use client'

import { useEffect, useState, useRef, Suspense } from 'react' // Ajout de Suspense
import { useRouter } from 'next/navigation'
import { supabase, ChatMessage, ChatConversation } from '@/lib/supabase'
import { useTheme } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Send, Paperclip, Check, CheckCheck, MessageSquare, Shield, Info } from 'lucide-react'

// 1. On déplace toute la logique dans un composant interne
function ChatContent() {
  const { theme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && conversation) {
      loadMessages()
      const channel = subscribeToRealtime()
      return () => { supabase.removeChannel(channel) }
    }
  }, [user, conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      await loadOrCreateConversation(user.id)
    }
  }

  const loadOrCreateConversation = async (userId: string) => {
    try {
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (existing) {
        setConversation(existing)
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({ user_id: userId, status: 'active' })
          .select().single()
        if (error) throw error
        setConversation(newConv)
      }
    } catch (error) {
      console.error('Erreur conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!conversation) return
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const subscribeToRealtime = () => {
    const channel = supabase.channel(`chat:${conversation?.id}`)
    
    channel
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `conversation_id=eq.${conversation?.id}` 
      }, (payload) => {
        const newMsg = payload.new as ChatMessage
        setMessages((current) => {
          const exists = current.some(m => m.id === newMsg.id)
          return exists ? current : [...current, newMsg]
        })
      })
      .subscribe()

    return channel
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversation || sending) return

    const content = newMessage
    setNewMessage('')
    setSending(true)

    try {
      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        message_type: 'text',
        content: content
      })

      if (error) throw error

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id)

    } catch (error: any) {
      console.error("Failed to send:", error)
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !conversation) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: upErr } = await supabase.storage.from('chat-images').upload(fileName, file)
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(fileName)
      
      await supabase.from('chat_messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        message_type: 'image',
        file_url: publicUrl,
        content: 'Image attachment'
      })
    } catch (e) {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFA52F] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Secure <span className="text-[#FFA52F] italic">Channel</span></h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Support Protocol Active</span>
                    </div>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#FFA52F]/10 px-4 py-2 rounded-full border border-[#FFA52F]/20">
                <Shield size={14} className="text-[#FFA52F]" />
                <span className="text-[9px] font-black uppercase tracking-tighter text-[#FFA52F]">End-to-End Encrypted</span>
            </div>
        </div>

        <div className={`flex-1 overflow-hidden flex flex-col rounded-[2.5rem] border ${theme === 'dark' ? 'bg-gray-900/40 border-white/5' : 'bg-white border-gray-200 shadow-xl'}`}>
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#FFA52F] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Info size={48} className="mb-4" />
                    <p className="font-black uppercase tracking-[0.2em] text-sm">System Ready</p>
                    <p className="text-xs max-w-[200px] mt-2">Transmit your order reference or inquiries below.</p>
                </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-6 py-4 rounded-[1.8rem] text-sm font-medium shadow-sm ${
                        isOwn 
                          ? 'bg-[#FFA52F] text-white rounded-tr-none' 
                          : theme === 'dark' ? 'bg-white/5 text-white rounded-tl-none border border-white/5' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        {msg.message_type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                        {msg.message_type === 'image' && msg.file_url && (
                            <img
                              src={msg.file_url}
                              alt="Attachment"
                              className="rounded-2xl max-h-64 object-cover cursor-pointer"
                              onClick={() => msg.file_url && window.open(msg.file_url, '_blank')}
                            />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 mt-2 px-1 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="text-[10px] font-black uppercase opacity-30">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwn && (
                            <div className="opacity-40">
                                {msg.is_read ? <CheckCheck size={12} className="text-[#FFA52F]" /> : <Check size={12} />}
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 md:p-6 border-t ${theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-inner border border-black/5 dark:border-white/5 focus-within:ring-2 ring-orange-500/20 transition-all">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-[#FFA52F]"
              >
                {uploading ? <div className="w-4 h-4 border-2 border-[#FFA52F] border-t-transparent rounded-full animate-spin"></div> : <Paperclip size={20} />}
              </button>
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Secure transmission..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold uppercase tracking-wider placeholder:opacity-30"
              />

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-12 h-12 bg-[#FFA52F] text-white flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg shadow-orange-500/30"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] opacity-20 mt-4">
                Transmission encrypted via ALLUVI Healthcare v3.4
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// 2. Export par défaut avec Suspense
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center italic text-[#FFA52F] uppercase text-xs tracking-widest">Initializing Secure Channel...</div>}>
      <ChatContent />
    </Suspense>
  )
}