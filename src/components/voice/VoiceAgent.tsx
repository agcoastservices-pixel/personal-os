'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Vapi from '@vapi-ai/web'
import type { CreateAssistantDTO } from '@vapi-ai/web/dist/api'
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

const JARVIS_SYSTEM_PROMPT = `You are Jarvis, a personal AI assistant. You help manage goals, tasks, business metrics, and daily priorities. Be concise, direct, and action-oriented.`

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending'

export default function VoiceAgent() {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const vapiRef = useRef<Vapi | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (!key) return

    const vapi = new Vapi(key)
    vapiRef.current = vapi

    vapi.on('call-start', () => {
      setStatus('active')
      setError(null)
    })

    vapi.on('call-end', () => {
      setStatus('idle')
      setIsSpeaking(false)
      setVolumeLevel(0)
    })

    vapi.on('speech-start', () => setIsSpeaking(true))
    vapi.on('speech-end', () => setIsSpeaking(false))

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level)
    })

    vapi.on('message', (msg: { type: string; role?: string; transcript?: string; transcriptType?: string }) => {
      if (msg.type === 'transcript' && msg.role && msg.transcript) {
        if (msg.transcriptType === 'final') {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: msg.role as 'user' | 'assistant',
              text: msg.transcript!,
              timestamp: new Date(),
            },
          ])
        }
      }
    })

    vapi.on('error', (err: Error) => {
      console.error('Vapi error:', err)
      setError('Connection error. Check your Vapi key.')
      setStatus('idle')
    })

    return () => {
      vapi.stop()
    }
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startCall = useCallback(async () => {
    if (!vapiRef.current) {
      setError('Vapi not initialized. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local')
      return
    }
    setStatus('connecting')
    setMessages([])
    try {
      const assistantConfig: CreateAssistantDTO = {
        transcriber: { provider: 'deepgram', model: 'nova-2', language: 'en-US' },
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          messages: [{ role: 'system', content: JARVIS_SYSTEM_PROMPT }],
        },
        voice: { provider: '11labs', voiceId: 'burt' },
        name: 'Jarvis',
      }
      await vapiRef.current.start(assistantConfig)
    } catch {
      setError('Failed to start call. Check your Vapi configuration.')
      setStatus('idle')
    }
  }, [])

  const endCall = useCallback(() => {
    setStatus('ending')
    vapiRef.current?.stop()
  }, [])

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'

  return (
    <div className="flex flex-col h-full">
      {/* Visualizer + Mic */}
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        {/* Waveform rings */}
        <div className="relative flex items-center justify-center">
          {isActive && (
            <>
              <div
                className="absolute rounded-full border border-blue-500/20 transition-all duration-100"
                style={{
                  width: `${100 + volumeLevel * 60}px`,
                  height: `${100 + volumeLevel * 60}px`,
                  opacity: volumeLevel > 0.05 ? 0.6 : 0.15,
                }}
              />
              <div
                className="absolute rounded-full border border-blue-500/15 transition-all duration-150"
                style={{
                  width: `${130 + volumeLevel * 90}px`,
                  height: `${130 + volumeLevel * 90}px`,
                  opacity: volumeLevel > 0.05 ? 0.3 : 0.08,
                }}
              />
            </>
          )}

          <button
            onClick={isActive ? endCall : startCall}
            disabled={isConnecting || status === 'ending'}
            className={cn(
              'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
              isActive
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
                : isConnecting
                ? 'bg-zinc-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 hover:shadow-blue-900/60 hover:scale-105 animate-glow'
            )}
          >
            {isConnecting || status === 'ending' ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isActive ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Status */}
        <div className="text-center">
          {isConnecting && (
            <p className="text-sm text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Connecting to Jarvis...
            </p>
          )}
          {isActive && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-zinc-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Jarvis is listening
              </p>
              {isSpeaking && (
                <p className="text-xs text-blue-400 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" /> Speaking...
                </p>
              )}
            </div>
          )}
          {status === 'idle' && !error && (
            <p className="text-sm text-zinc-600">Press to talk to Jarvis</p>
          )}
          {error && (
            <p className="text-xs text-red-400 max-w-xs text-center">{error}</p>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 border-t border-zinc-800/60 overflow-hidden flex flex-col">
        <div className="px-6 py-3 border-b border-zinc-800/40">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Transcript</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-zinc-700">Conversation will appear here...</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 animate-slide-up',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-zinc-700 text-zinc-300' : 'bg-blue-600 text-white'
                )}>
                  {msg.role === 'user' ? 'A' : 'J'}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                  msg.role === 'user'
                    ? 'bg-zinc-800 text-zinc-200 rounded-tr-sm'
                    : 'bg-blue-600/15 border border-blue-600/20 text-zinc-200 rounded-tl-sm'
                )}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  )
}
