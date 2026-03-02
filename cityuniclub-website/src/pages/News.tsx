import React, { useEffect, useState } from 'react'
import { api, ClubNews } from '../services/api'

export const News: React.FC = () => {
  const [news, setNews] = useState<ClubNews[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getNews().then(setNews).finally(() => setIsLoading(false))
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cambridge-blue mx-auto mb-4"></div>
          <p>Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-card-white sticky top-0 z-10 pt-12 pb-4 px-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-oxford-blue">Club News</h1>
        </div>
      </div>

      {/* News List */}
      <div className="p-4 space-y-4">
        {news.map((item) => (
          <div key={item.id} className="bg-card-white rounded-xl shadow-lg p-4">
            {/* Category Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="bg-cambridge-blue text-white text-xs px-3 py-1 rounded-full font-medium">
                {item.category}
              </span>
              <span className="text-xs text-secondary-text">{formatDate(item.published_date)}</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-2">
              {item.title}
            </h3>

            {/* Content */}
            <p className="text-secondary-text text-sm mb-3 line-clamp-3">
              {item.content}
            </p>

            {/* Read More */}
            <button className="text-oxford-blue text-sm font-semibold flex items-center space-x-1">
              <span>Read More</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
