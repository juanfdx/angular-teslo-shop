
// IS IMAGE
export const isImage = (filename: string): boolean => {
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(filename)
}