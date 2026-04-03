export interface ThemePostSummary {
  id: string | number
  title: string
  excerpt?: string
  url?: string
  likesCount?: number
  commentsCount?: number
  readingTime?: string
}

export interface ThemePostDetail extends ThemePostSummary {
  content: string
}

export interface HomeLayoutProps {
  title?: string
  subtitle?: string
}

export interface PostListProps {
  posts: ThemePostSummary[]
  loading?: boolean
}

export interface PostDetailProps {
  post: ThemePostDetail
}

export interface NavItem {
  label: string
  icon?: string
  path: string
}

export interface SidebarNavProps {
  items: NavItem[]
  currentPath?: string
}

export interface SiteStatsData {
  runningDays: number
  postCount: number
  viewCount: string
  commentCount: number
  tagCount: number
}

export interface SiteStatsProps {
  stats: SiteStatsData
}

export interface SubscribeCardProps {
  description?: string
  placeholder?: string
}

export interface BlogFooterProps {
  copyright?: string
  poweredBy?: string
  links?: { label: string, url: string }[]
}

export interface ThemeComponentContracts {
  HomeLayout: HomeLayoutProps
  PostList: PostListProps
  PostDetail: PostDetailProps
  SidebarNav: SidebarNavProps
  SiteStats: SiteStatsProps
  SubscribeCard: SubscribeCardProps
  BlogFooter: BlogFooterProps
}

export const themeContractNames = [
  'HomeLayout',
  'PostList',
  'PostDetail',
  'SidebarNav',
  'SiteStats',
  'SubscribeCard',
  'BlogFooter'
] as const

export type ThemeContractName = typeof themeContractNames[number]
