'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/app/lib/supabase'

type Comment = {
  id: string
  content: string
  created_at: string
  users: { id: string; name: string; avatar_url: string | null } | null
}

type Props = {
  type: 'project' | 'article'
  targetId: string
}

export default function Comments({ type, targetId }: Props) {
  const table = type === 'project' ? 'project_comments' : 'article_comments'
  const field = type === 'project' ? 'project_id' : 'article_id'

  const [comments, setComments] = useState<Comment[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    load()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  async function load() {
    const { data } = await supabase
      .from(table)
      .select('id, content, created_at, users(id, name, avatar_url)')
      .eq(field, targetId)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !userId) return

    setSubmitting(true)
    const { data, error } = await supabase
      .from(table)
      .insert({ [field]: targetId, user_id: userId, content: trimmed })
      .select('id, content, created_at, users(id, name, avatar_url)')
      .single()

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment])
      setText('')
      textareaRef.current?.focus()
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from(table).delete().eq('id', id)
    setComments((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="mt-10 pt-8 border-t border-zinc-100">
      <h2 className="text-sm font-semibold text-zinc-900 mb-6">
        {comments.length > 0 ? `${comments.length} comentário${comments.length !== 1 ? 's' : ''}` : 'Comentários'}
      </h2>

      {comments.length > 0 && (
        <div className="flex flex-col gap-5 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                {comment.users?.avatar_url ? (
                  <Image src={comment.users.avatar_url} alt={comment.users.name} width={28} height={28} className="rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-500">
                    {comment.users?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-800">{comment.users?.name}</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                {userId === comment.users?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="mt-1 text-xs text-zinc-300 hover:text-red-400 transition disabled:opacity-50"
                  >
                    {deletingId === comment.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {userId ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
            }}
            placeholder="Escreva um comentário..."
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-zinc-400">
          <a href="/login" className="text-zinc-600 underline hover:text-zinc-900 transition">Faça login</a> para comentar.
        </p>
      )}
    </div>
  )
}
