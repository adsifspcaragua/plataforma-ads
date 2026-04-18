'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Select from '@/app/components/Select'

type Props = {
  tags: string[]
  authors: { id: string; name: string }[]
}

export default function ArticleFilters({ tags, authors }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilters = searchParams.has('tag') || searchParams.has('autor')

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Select
        value={searchParams.get('tag') ?? ''}
        onChange={(v) => update('tag', v)}
        placeholder="Todas as tags"
        options={tags.map((t) => ({ value: t, label: t }))}
        className="w-44"
      />
      <Select
        value={searchParams.get('autor') ?? ''}
        onChange={(v) => update('autor', v)}
        placeholder="Todos os autores"
        options={authors.map((a) => ({ value: a.id, label: a.name }))}
        className="w-44"
      />
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-zinc-400 hover:text-zinc-700 transition px-1"
        >
          Limpar ×
        </button>
      )}
    </div>
  )
}
