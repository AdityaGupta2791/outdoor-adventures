import { useEffect } from 'react'

const SITE = 'Outdoor Adventures'

/**
 * Set document.title for the current page.
 * Pass null/undefined while data is loading — the previous title is kept.
 * On unmount the document falls back to the site name.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · ${SITE}`
    return () => {
      document.title = previous || SITE
    }
  }, [title])
}
