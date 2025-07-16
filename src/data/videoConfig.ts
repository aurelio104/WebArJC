// src/data/videoConfig.ts
export const videoConfig = Array.from({ length: 22 }, (_, i) => ({
  id: `video${i + 1}`,
  src: `assets/videos/video${i + 1}.mp4`,
  targetIndex: i
}))
