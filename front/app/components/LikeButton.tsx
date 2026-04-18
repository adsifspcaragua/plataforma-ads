'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type Props = {
  type: 'project' | 'article'
  targetId: string
  initialCount: number
}

export default function LikeButton({ type, targetId, initialCount }: Props) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const table = type === 'project' ? 'project_likes' : 'article_likes'
  const field = type === 'project' ? 'project_id' : 'article_id'

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase
        .from(table)
        .select('user_id')
        .eq(field, targetId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setLiked(!!data))
    })
  }, [table, field, targetId])

  async function toggle() {
    if (!userId || loading) return
    setLoading(true)
    if (liked) {
      await supabase.from(table).delete().eq(field, targetId).eq('user_id', userId)
      setLiked(false)
      setCount((c) => c - 1)
    } else {
      await supabase.from(table).insert({ user_id: userId, [field]: targetId })
      setLiked(true)
      setCount((c) => c + 1)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={!userId ? 'Faça login para curtir' : liked ? 'Descurtir' : 'Curtir'}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
        liked
          ? 'bg-red-50 text-red-500 border border-red-200'
          : userId
          ? 'text-zinc-400 border border-zinc-200 hover:text-red-400 hover:bg-red-50 hover:border-red-200'
          : 'text-zinc-300 border border-zinc-100 cursor-default'
      }`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      <span>{count}</span>
    </button>
  )
}
