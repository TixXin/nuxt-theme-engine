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

export interface ThemeComponentContracts {
  HomeLayout: HomeLayoutProps
  PostList: PostListProps
  PostDetail: PostDetailProps
}

export const themeContractNames = [
  'HomeLayout',
  'PostList',
  'PostDetail'
] as const

export type ThemeContractName = typeof themeContractNames[number]
