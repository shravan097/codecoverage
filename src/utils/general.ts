/** input: dist/index.test.ts --> output: index */
export function getFileNameFirstItemFromPath(path: string): string | undefined {
  const rawFileName = path?.split('/')?.pop()
  return rawFileName?.split('.')?.[0]
}
