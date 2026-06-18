export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Transcript {
  id: string
  user_id: string
  title: string
  url: string
  content: string
  language: string
  duration?: number
  created_at: string
  updated_at: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  billing: 'monthly' | 'yearly'
  description: string
  features: string[]
  highlighted: boolean
  cta: string
}

export interface NavItem {
  label: string
  href: string
}
