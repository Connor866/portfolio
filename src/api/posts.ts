import type { Post } from '../types'
import { defaultPosts } from '../data/posts'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'posts'

/** 读取文章列表（按日期倒序） */
export function getPosts(): Post[] {
  return readJSON<Post[]>(KEY, defaultPosts).slice().sort((a, b) => b.date.localeCompare(a.date))
}

/** 按 slug 查找文章 */
export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug)
}

/** 保存文章列表 */
export function savePosts(posts: Post[]): void {
  writeJSON<Post[]>(KEY, posts)
}

/** 恢复默认文章 */
export function resetPosts(): void {
  removeKey(KEY)
}
