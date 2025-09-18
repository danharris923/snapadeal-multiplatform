export const normalizeFlippImg = (u?: string) => {
  if (!u) return u
  if (u.startsWith("//")) return "https:" + u
  if (u.startsWith("http://")) return u.replace("http://", "https://")
  return u
}