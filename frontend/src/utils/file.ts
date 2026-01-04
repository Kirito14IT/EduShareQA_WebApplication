import env from '../config/env'

/**
 * Constructs a full file URL from a backend file path.
 * 
 * Logic:
 * 1. If path is absolute (http/https), return as is.
 * 2. If path starts with '/', append to apiBaseUrl.
 * 3. If path starts with known file directories (resources/, etc.), prepend apiBaseUrl + /uploads/.
 * 4. Otherwise, prepend apiBaseUrl.
 * 
 * @param path The file path from backend
 * @param token Optional auth token to append
 * @returns Full URL string
 */
export const getFileUrl = (path: string | null | undefined, token?: string): string => {
  if (!path) return '#'
  
  let url = path
  
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
      // Normalize base url to not have trailing slash
      const baseUrl = env.apiBaseUrl.endsWith('/') ? env.apiBaseUrl.slice(0, -1) : env.apiBaseUrl
      
      if (path.startsWith('/')) {
          // Absolute path from root (e.g. /student/resources/... or /uploads/...)
          url = `${baseUrl}${path}`
      } else if (path.startsWith('uploads/')) {
           url = `${baseUrl}/${path}`
      } else if (path.startsWith('resources/') || 
                 path.startsWith('question-attachments/') || 
                 path.startsWith('answer-attachments/')) {
           // Known relative file paths, assuming they are in uploads directory
           url = `${baseUrl}/uploads/${path}`
      } else {
           // Fallback
           url = `${baseUrl}/${path}`
      }
  }

  // Append token
  if (token) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}token=${token}`
  }
  
  return url
}
