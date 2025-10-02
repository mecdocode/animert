import React, { useState } from 'react'

const AnimeCard = ({ anime, index }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fallback data structure
  const animeData = {
    title: anime?.title?.english || anime?.title?.romaji || anime?.title || 'Unknown Title',
    image: anime?.coverImage?.large || anime?.coverImage?.medium || anime?.image || '/placeholder-anime.jpg',
    score: anime?.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A',
    genres: anime?.genres || [],
    year: anime?.seasonYear || anime?.startDate?.year || 'Unknown',
    episodes: anime?.episodes || 'Unknown',
    status: anime?.status || 'Unknown',
    description: anime?.description || 'No description available.',
    format: anime?.format || 'Unknown'
  }

  // Clean HTML from description
  const cleanDescription = animeData.description
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .substring(0, 200) + (animeData.description.length > 200 ? '...' : '')

  return (
    <div 
      className="anime-card group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden mb-3 bg-terminal-dark">
        <img
          src={animeData.image}
          alt={animeData.title}
          className={`w-full h-48 object-cover transition-all duration-75 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered ? 'scale-105 brightness-110' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNkZmY5ZmIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OTyBJTUFHRTwvdGV4dD48L3N2Zz4='
            setImageLoaded(true)
          }}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-terminal-dark">
            <div className="font-terminal text-sm text-crt-green animate-pulse">
              LOADING<span className="loading-dots"></span>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-center p-3 transition-all duration-75">
            <div className="font-terminal text-xs text-crt-text leading-relaxed">
              {cleanDescription}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-terminal text-lg text-crt-text mb-2 group-hover:text-crt-cyan transition-colors duration-75">
        {animeData.title}
      </h3>

      {/* Details */}
      <div className="space-y-1">
        <div className="font-terminal text-sm text-crt-green">
          Score: <span className="text-crt-amber">{animeData.score}/10</span>
        </div>
        
        <div className="font-terminal text-sm text-crt-green">
          Year: <span className="text-crt-amber">{animeData.year}</span>
        </div>

        <div className="font-terminal text-sm text-crt-green">
          Episodes: <span className="text-crt-amber">{animeData.episodes}</span>
        </div>

        {animeData.genres.length > 0 && (
          <div className="font-terminal text-sm text-crt-green">
            Genres: <span className="text-crt-amber">
              {animeData.genres.slice(0, 3).join(', ')}
            </span>
          </div>
        )}

        <div className="font-terminal text-xs text-crt-green mt-2">
          Format: <span className="text-crt-amber">{animeData.format}</span>
        </div>
      </div>

      {/* Retro Border Effect */}
      <div className={`absolute inset-0 border-2 transition-all duration-75 pointer-events-none ${
        isHovered 
          ? 'border-crt-magenta shadow-lg shadow-crt-magenta/20' 
          : 'border-transparent'
      }`} />
    </div>
  )
}

export default AnimeCard
