import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconNews } from '../icons'
import { api, ClubNews } from '../services/api'

let newsCache: ClubNews[] | null = null

export const News: React.FC = () => {
  const [news, setNews] = useState<ClubNews[]>(newsCache ?? [])
  const [isLoading, setIsLoading] = useState(newsCache === null)

  useEffect(() => {
    if (newsCache !== null) return
    api.getNews().then(data => { newsCache = data; setNews(data) }).finally(() => setIsLoading(false))
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ivory text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cambridge mx-auto mb-4"></div>
          <p className="label-caps text-ivory/40">Loading</p>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-oxford-blue/80 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 text-ivory">
          <IconNews />
          <h1 className="font-serif text-2xl font-normal text-ivory">Club News</h1>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <div key={item.id} className="club-card p-5 flex flex-col">
              {/* Category Badge & Date */}
              <div className="flex items-center justify-between mb-3">
                <span className="label-caps border border-cambridge/40 text-cambridge-muted px-2.5 py-0.5 rounded-sm">
                  {item.category}
                </span>
                <span className="label-caps text-ink-light">{formatDate(item.published_date)}</span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-oxford-blue font-normal text-base leading-snug mb-2">
                {item.title}
              </h3>

              {/* Content */}
              <p className="text-ink-mid text-sm leading-relaxed mb-3 flex-1 line-clamp-3">
                {item.content}
              </p>

              {/* Read More */}
              <Link to={`/news/${item.id}`} className="flex items-center space-x-1 mt-auto">
                <span className="label-caps text-cambridge-muted hover:text-oxford-blue transition">Read More</span>
                <svg className="w-3 h-3 text-cambridge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
