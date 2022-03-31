export function getFixturePath(fileName: string): string {
  let path = __filename.split('/')
  path.pop()
  path.push(fileName)
  return path.join('/')
}