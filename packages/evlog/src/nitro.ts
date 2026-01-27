function matchesPattern(path: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except * and ?
    .replace(/\*\*/g, '{{GLOBSTAR}}') // Temp placeholder for **
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/{{GLOBSTAR}}/g, '.*') // ** matches anything including /
    .replace(/\?/g, '[^/]') // ? matches single char except /

  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(path)
}

export function shouldLog(path: string, include?: string[]): boolean {
  // If no include patterns, log everything
  if (!include || include.length === 0) {
    return true
  }
  // Log only if path matches at least one include pattern
  return include.some(pattern => matchesPattern(path, pattern))
}
