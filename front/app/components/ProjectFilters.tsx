'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Select from '@/app/components/Select'

type Props = {
  tags: string[]
  semesters: number[]
  students: { id: string; name: string }[]
}

export default function ProjectFilters({ tags, semesters, students }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasFilters =
    searchParams.has('tag') || searchParams.has('semester') || searchParams.has('aluno')

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Select
        value={searchParams.get('tag') ?? ''}
        onChange={(v) => update('tag', v)}
        placeholder="Todas as tecnologias"
        options={tags.map((t) => ({ value: t, label: t }))}
        className="w-48"
      />
      <Select
        value={searchParams.get('semester') ?? ''}
        onChange={(v) => update('semester', v)}
        placeholder="Todos os semestres"
        options={semesters.map((s) => ({ value: String(s), label: `${s}º semestre` }))}
        className="w-44"
      />
      <Select
        value={searchParams.get('aluno') ?? ''}
        onChange={(v) => update('aluno', v)}
        placeholder="Todos os alunos"
        options={students.map((s) => ({ value: s.id, label: s.name }))}
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
