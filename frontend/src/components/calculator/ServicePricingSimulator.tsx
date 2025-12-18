'use client'

import { useState, useMemo } from 'react'
import { formatCurrency, cn } from '@/lib/utils'
import {
  IMAGE_TOOLS,
  VIDEO_TOOLS,
  MUSIC_TOOLS,
  getImageCost,
  getVideoCost,
  getMusicCost,
} from '@/lib/clientCostPricing'
import {
  Image,
  Video,
  Music,
  Plus,
  Trash2,
  ChevronDown,
  Calculator,
} from 'lucide-react'

// Types for usage items
interface ImageUsageItem {
  id: string
  toolId: string
  qualityIndex: number
  quantity: number
}

interface VideoUsageItem {
  id: string
  toolId: string
  optionIndex: number
  quantity: number
}

interface MusicUsageItem {
  id: string
  toolId: string
  tierIndex: number
  quantity: number
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export function ServicePricingSimulator() {
  // State for image usage
  const [imageUsage, setImageUsage] = useState<ImageUsageItem[]>([
    { id: generateId(), toolId: 'freepik', qualityIndex: 2, quantity: 20 },
  ])

  // State for video usage
  const [videoUsage, setVideoUsage] = useState<VideoUsageItem[]>([
    { id: generateId(), toolId: 'freepik_video', optionIndex: 0, quantity: 3 },
  ])

  // State for music usage
  const [musicUsage, setMusicUsage] = useState<MusicUsageItem[]>([
    { id: generateId(), toolId: 'suno', tierIndex: 0, quantity: 5 },
  ])

  // Calculate costs
  const costs = useMemo(() => {
    // Image costs
    const imageCosts = imageUsage.map((item) => {
      const tool = IMAGE_TOOLS.find((t) => t.id === item.toolId)
      const costPerImage = getImageCost(item.toolId, item.qualityIndex)
      const total = costPerImage * item.quantity
      const qualityLabel = tool?.hasQualities
        ? tool.qualities?.[item.qualityIndex]?.label || ''
        : ''
      return {
        name: tool?.name || '',
        quality: qualityLabel,
        quantity: item.quantity,
        costPerUnit: costPerImage,
        total,
      }
    })

    // Video costs
    const videoCosts = videoUsage.map((item) => {
      const tool = VIDEO_TOOLS.find((t) => t.id === item.toolId)
      const costPerVideo = getVideoCost(item.toolId, item.optionIndex)
      const total = costPerVideo * item.quantity
      const optionLabel = tool?.options[item.optionIndex]?.label || ''
      return {
        name: tool?.name || '',
        option: optionLabel,
        quantity: item.quantity,
        costPerUnit: costPerVideo,
        total,
      }
    })

    // Music costs
    const musicCosts = musicUsage.map((item) => {
      const tool = MUSIC_TOOLS.find((t) => t.id === item.toolId)
      const costPerSong = getMusicCost(item.toolId, item.tierIndex)
      const total = costPerSong * item.quantity
      const tierLabel = tool?.tiers[item.tierIndex]?.label || ''
      return {
        name: tool?.name || '',
        tier: tierLabel,
        quantity: item.quantity,
        costPerUnit: costPerSong,
        total,
      }
    })

    // Totals
    const imageTotal = imageCosts.reduce((sum, c) => sum + c.total, 0)
    const videoTotal = videoCosts.reduce((sum, c) => sum + c.total, 0)
    const musicTotal = musicCosts.reduce((sum, c) => sum + c.total, 0)
    const grandTotal = imageTotal + videoTotal + musicTotal

    return {
      image: imageCosts,
      imageTotal,
      video: videoCosts,
      videoTotal,
      music: musicCosts,
      musicTotal,
      grandTotal,
    }
  }, [imageUsage, videoUsage, musicUsage])

  // Handlers for image usage
  const addImageItem = () => {
    setImageUsage([
      ...imageUsage,
      { id: generateId(), toolId: 'freepik', qualityIndex: 2, quantity: 10 },
    ])
  }

  const removeImageItem = (id: string) => {
    if (imageUsage.length > 0) {
      setImageUsage(imageUsage.filter((item) => item.id !== id))
    }
  }

  const updateImageItem = (id: string, updates: Partial<ImageUsageItem>) => {
    setImageUsage(
      imageUsage.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  // Handlers for video usage
  const addVideoItem = () => {
    setVideoUsage([
      ...videoUsage,
      { id: generateId(), toolId: 'freepik_video', optionIndex: 0, quantity: 2 },
    ])
  }

  const removeVideoItem = (id: string) => {
    if (videoUsage.length > 0) {
      setVideoUsage(videoUsage.filter((item) => item.id !== id))
    }
  }

  const updateVideoItem = (id: string, updates: Partial<VideoUsageItem>) => {
    setVideoUsage(
      videoUsage.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  // Handlers for music usage
  const addMusicItem = () => {
    setMusicUsage([
      ...musicUsage,
      { id: generateId(), toolId: 'suno', tierIndex: 0, quantity: 5 },
    ])
  }

  const removeMusicItem = (id: string) => {
    if (musicUsage.length > 0) {
      setMusicUsage(musicUsage.filter((item) => item.id !== id))
    }
  }

  const updateMusicItem = (id: string, updates: Partial<MusicUsageItem>) => {
    setMusicUsage(
      musicUsage.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }

  return (
    <div className="space-y-6">
      {/* Image Generation Section */}
      <div className="rounded-2xl bg-[#17181C] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Image className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Image Generation</h3>
              <p className="text-sm text-muted-foreground">Cost per image</p>
            </div>
          </div>
          <button
            onClick={addImageItem}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        </div>

        {imageUsage.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No image generation tools added. Click "Add Tool" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {imageUsage.map((item) => {
              const tool = IMAGE_TOOLS.find((t) => t.id === item.toolId)
              const costPerImage = getImageCost(item.toolId, item.qualityIndex)
              const subtotal = costPerImage * item.quantity

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#17181C] border border-border/50"
                >
                  {/* Tool select */}
                  <div className="relative flex-1">
                    <select
                      value={item.toolId}
                      onChange={(e) =>
                        updateImageItem(item.id, {
                          toolId: e.target.value,
                          qualityIndex: 0,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg appearance-none',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                    >
                      {IMAGE_TOOLS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Quality select (if applicable) */}
                  {tool?.hasQualities && tool.qualities && (
                    <div className="relative flex-1">
                      <select
                        value={item.qualityIndex}
                        onChange={(e) =>
                          updateImageItem(item.id, {
                            qualityIndex: parseInt(e.target.value),
                          })
                        }
                        className={cn(
                          'w-full px-3 py-2 rounded-lg appearance-none',
                          'bg-[#17181C] border border-border/50',
                          'text-foreground text-sm',
                          'focus:outline-none focus:ring-2 focus:ring-primary/20',
                          'cursor-pointer'
                        )}
                      >
                        {tool.qualities.map((q, idx) => (
                          <option key={idx} value={idx}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  )}

                  {/* Quantity input */}
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateImageItem(item.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-center',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20'
                      )}
                      placeholder="Qty"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="w-28 text-right">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeImageItem(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Video Generation Section */}
      <div className="rounded-2xl bg-[#17181C] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Video Generation</h3>
              <p className="text-sm text-muted-foreground">Cost per video</p>
            </div>
          </div>
          <button
            onClick={addVideoItem}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        </div>

        {videoUsage.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No video generation tools added. Click "Add Tool" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {videoUsage.map((item) => {
              const tool = VIDEO_TOOLS.find((t) => t.id === item.toolId)
              const costPerVideo = getVideoCost(item.toolId, item.optionIndex)
              const subtotal = costPerVideo * item.quantity

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#17181C] border border-border/50"
                >
                  {/* Tool select */}
                  <div className="relative flex-1">
                    <select
                      value={item.toolId}
                      onChange={(e) =>
                        updateVideoItem(item.id, {
                          toolId: e.target.value,
                          optionIndex: 0,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg appearance-none',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                    >
                      {VIDEO_TOOLS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Model/Tier select */}
                  <div className="relative flex-1">
                    <select
                      value={item.optionIndex}
                      onChange={(e) =>
                        updateVideoItem(item.id, {
                          optionIndex: parseInt(e.target.value),
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg appearance-none',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                    >
                      {tool?.options.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Quantity input */}
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateVideoItem(item.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-center',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20'
                      )}
                      placeholder="Qty"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="w-28 text-right">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeVideoItem(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Music Generation Section */}
      <div className="rounded-2xl bg-[#17181C] border border-border/50 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Music className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Music Generation</h3>
              <p className="text-sm text-muted-foreground">Cost per song</p>
            </div>
          </div>
          <button
            onClick={addMusicItem}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        </div>

        {musicUsage.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No music generation tools added. Click "Add Tool" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {musicUsage.map((item) => {
              const tool = MUSIC_TOOLS.find((t) => t.id === item.toolId)
              const costPerSong = getMusicCost(item.toolId, item.tierIndex)
              const subtotal = costPerSong * item.quantity

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#17181C] border border-border/50"
                >
                  {/* Tool select */}
                  <div className="relative flex-1">
                    <select
                      value={item.toolId}
                      onChange={(e) =>
                        updateMusicItem(item.id, {
                          toolId: e.target.value,
                          tierIndex: 0,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg appearance-none',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                    >
                      {MUSIC_TOOLS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Tier select */}
                  <div className="relative flex-1">
                    <select
                      value={item.tierIndex}
                      onChange={(e) =>
                        updateMusicItem(item.id, {
                          tierIndex: parseInt(e.target.value),
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg appearance-none',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20',
                        'cursor-pointer'
                      )}
                    >
                      {tool?.tiers.map((tier, idx) => (
                        <option key={idx} value={idx}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Quantity input */}
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateMusicItem(item.id, {
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-center',
                        'bg-[#17181C] border border-border/50',
                        'text-foreground text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-primary/20'
                      )}
                      placeholder="Qty"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="w-28 text-right">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeMusicItem(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cost Breakdown Section */}
      <div className="rounded-2xl bg-[#17181C] border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center gap-3">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Image Generation */}
          {costs.imageTotal > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Image Generation
              </h4>
              {costs.image.map((cost, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-foreground">
                    {cost.name} ({cost.quantity} x {cost.quality || 'standard'})
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(cost.total)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Video Generation */}
          {costs.videoTotal > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Video Generation
              </h4>
              {costs.video.map((cost, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-foreground">
                    {cost.name} ({cost.quantity} x {cost.option})
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(cost.total)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Music Generation */}
          {costs.musicTotal > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Music Generation
              </h4>
              {costs.music.map((cost, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-foreground">
                    {cost.name} ({cost.quantity} x {cost.tier})
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(cost.total)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {costs.grandTotal === 0 && (
            <div className="py-4 text-center text-muted-foreground text-sm">
              Add tools above to see the cost breakdown.
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="p-5 bg-primary/5 border-t border-primary/20">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              Total Project Cost
            </span>
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(costs.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
