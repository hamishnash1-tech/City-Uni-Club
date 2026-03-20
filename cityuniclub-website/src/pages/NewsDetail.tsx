import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, ClubNews } from '../services/api'

let newsCache: ClubNews[] | null = null

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<ClubNews | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (!newsCache) {
          newsCache = await api.getNews()
        }
        const found = newsCache.find(n => n.id === id) ?? null
        setArticle(found)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ivory/50 font-cormorant text-lg">Article not found.</p>
        <button onClick={() => navigate('/news')} className="mt-6 label-caps text-cambridge hover:text-cambridge-light transition">
          ← Back to News
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/news')} className="label-caps text-cambridge/70 hover:text-cambridge transition mb-6 block">
        ← Back to News
      </button>

      <div className="club-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="label-caps border border-cambridge/40 text-cambridge-muted px-2.5 py-0.5 rounded-sm">
            {article.category}
          </span>
          <span className="label-caps text-ink-light">{formatDate(article.published_date)}</span>
        </div>

        <h1 className="font-serif text-oxford-blue font-normal text-2xl leading-snug mb-6">
          {article.title}
        </h1>

        <p className="text-ink-mid text-sm leading-relaxed whitespace-pre-wrap">
          {article.content}
        </p>
      </div>
    </div>
  )
}
