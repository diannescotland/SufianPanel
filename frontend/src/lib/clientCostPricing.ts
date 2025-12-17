// Client Cost Pricing - Source of Truth
// Based on SubsPrices2.md and videomusic.md

export interface PricingOption {
  label: string
  cost: number
}

export interface ImageTool {
  id: string
  name: string
  hasQualities: boolean
  qualities?: PricingOption[]
  costPerImage?: number
}

export interface VideoTool {
  id: string
  name: string
  options: PricingOption[]
}

export interface MusicTool {
  id: string
  name: string
  tiers: PricingOption[]
}

export interface FlatFeeTool {
  id: string
  name: string
  defaultCost: number
}

// Image generation tools with their costs per image in MAD
export const IMAGE_TOOLS: ImageTool[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    hasQualities: false,
    costPerImage: 0.39, // 1024×1024
  },
  {
    id: 'freepik',
    name: 'Freepik',
    hasQualities: true,
    qualities: [
      { label: 'Low (5 credits)', cost: 0.03 },
      { label: 'Medium (10 credits)', cost: 0.06 },
      { label: 'High (80 credits)', cost: 0.48 },
      { label: 'Professional (100-150 credits)', cost: 0.75 },
    ],
  },
  {
    id: 'openart',
    name: 'OpenArt',
    hasQualities: true,
    qualities: [
      { label: 'Standard (10 credits)', cost: 0.15 },
      { label: 'High Quality (50 credits)', cost: 0.60 },
    ],
  },
]

// Video generation tools with their costs per video in MAD
export const VIDEO_TOOLS: VideoTool[] = [
  {
    id: 'freepik_video',
    name: 'Freepik Video',
    options: [
      { label: 'Kling 2.6 Pro (325 credits)', cost: 2.00 },
      { label: 'Seedance 1.0 Pro (480 credits)', cost: 3.00 },
      { label: 'MiniMax Hailuo (600 credits)', cost: 4.00 },
      { label: 'Google Veo 3.1 (1300 credits)', cost: 8.50 },
    ],
  },
  {
    id: 'higgsfield',
    name: 'Higgsfield',
    options: [
      { label: 'Pro (20 credits)', cost: 12.00 },
      { label: 'Ultimate (89 credits)', cost: 6.00 },
    ],
  },
]

// Music generation tools with their costs per song in MAD
export const MUSIC_TOOLS: MusicTool[] = [
  {
    id: 'suno',
    name: 'Suno AI',
    tiers: [
      { label: 'Pro', cost: 0.20 },
      { label: 'Premier', cost: 0.15 },
    ],
  },
]

// Flat monthly fee tools (cost divided by number of clients)
export const FLAT_FEE_TOOLS: FlatFeeTool[] = [
  { id: 'chatgpt', name: 'ChatGPT', defaultCost: 200 },
  { id: 'adobe', name: 'Adobe', defaultCost: 150 },
  { id: 'gemini_api', name: 'Gemini API', defaultCost: 50 },
]

// Helper function to get cost per image for a tool
export function getImageCost(toolId: string, qualityIndex?: number): number {
  const tool = IMAGE_TOOLS.find((t) => t.id === toolId)
  if (!tool) return 0

  if (tool.hasQualities && tool.qualities && qualityIndex !== undefined) {
    return tool.qualities[qualityIndex]?.cost || 0
  }

  return tool.costPerImage || 0
}

// Helper function to get cost per video for a tool
export function getVideoCost(toolId: string, optionIndex: number): number {
  const tool = VIDEO_TOOLS.find((t) => t.id === toolId)
  if (!tool) return 0

  return tool.options[optionIndex]?.cost || 0
}

// Helper function to get cost per song for a tool
export function getMusicCost(toolId: string, tierIndex: number): number {
  const tool = MUSIC_TOOLS.find((t) => t.id === toolId)
  if (!tool) return 0

  return tool.tiers[tierIndex]?.cost || 0
}
