import { markers } from './targets'

// ✅ Elementos del DOM
const markerInfo = document.getElementById('marker-info')
const camError = document.getElementById('cam-error')
const camVideo = document.getElementById('mindar-video') as HTMLVideoElement | null
const startButton = document.getElementById('start-button')
const startScreen = document.getElementById('start-screen')
const scene = document.querySelector('a-scene') as HTMLElement | null

if (!camVideo || !startButton || !startScreen || !scene) {
  console.error('❌ Elementos esenciales no encontrados en el DOM.')
  throw new Error('Faltan elementos esenciales')
}

// ✅ Botón para iniciar WebAR
startButton.addEventListener('click', () => {
  startScreen.style.display = 'none'

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' } })
    .then((stream) => {
      camVideo.srcObject = stream
      return camVideo.play()
    })
    .then(() => {
      console.log('🎥 Cámara inicializada correctamente.')
      if (camError) camError.style.display = 'none'
    })
    .catch((err) => {
      console.error('⚠️ Error al acceder a la cámara:', err)
      if (camError) camError.style.display = 'block'
    })
})

// ✅ Componente para debug (opcional)
AFRAME.registerComponent('debug-log', {
  init() {
    console.log('✅ A-Frame entity initialized:', this.el)
  }
})

// ✅ Componente para manejar eventos del marcador
AFRAME.registerComponent('marker-events', {
  init() {
    const el = this.el as HTMLElement
    const targetIndex = (el as any).components['mindar-image-target'].data.targetIndex

    const videoId = `video${targetIndex + 1}`
    const video = document.getElementById(videoId) as HTMLVideoElement | null

    el.addEventListener('targetFound', () => {
      console.log(`🎯 Marcador detectado: targetIndex = ${targetIndex}`)
      if (markerInfo) markerInfo.textContent = `Marcador detectado ✅`

      if (video) {
        const parent = video.parentElement as HTMLElement
        parent.setAttribute('visible', 'false')

        video.pause()
        video.currentTime = 0
        video.load()

        const playWhenReady = () => {
          if (video.readyState >= 2) {
            try {
              video.play()
              parent.setAttribute('visible', 'true')
              console.log(`▶️ Reproduciendo ${videoId}`)
            } catch (err) {
              console.warn(`⚠️ No se pudo reproducir ${videoId}:`, err)
            }
            video.removeEventListener('canplay', playWhenReady)
          }
        }

        video.addEventListener('canplay', playWhenReady)
      }
    })

    el.addEventListener('targetLost', () => {
      console.log(`🕳️ Marcador perdido: targetIndex = ${targetIndex}`)
      if (markerInfo) markerInfo.textContent = 'Marcador: ---'
      if (video) video.pause()
    })
  }
})

// ✅ Agregar dinámicamente los <a-assets> con los videos
const assetsContainer = document.createElement('a-assets')

markers.forEach(({ id, video }) => {
  const videoEl = document.createElement('video')
  videoEl.setAttribute('id', `video${id}`)
  videoEl.setAttribute('src', `assets/videos/${video}`)
  videoEl.setAttribute('preload', 'auto')
  videoEl.setAttribute('crossorigin', 'anonymous')
  videoEl.setAttribute('loop', '')
  videoEl.setAttribute('muted', '')
  videoEl.setAttribute('playsinline', '')
  videoEl.setAttribute('autoplay', '') // añadido por compatibilidad
  assetsContainer.appendChild(videoEl)
})

scene.appendChild(assetsContainer)

// ✅ Agregar entidades para cada marcador y su video
markers.forEach(({ id, width = 1, height = 1.6, position = '0 0 0', rotation = '0 0 0' }) => {
  const entity = document.createElement('a-entity')
  entity.setAttribute('mindar-image-target', `targetIndex: ${id - 1}`)
  entity.setAttribute('marker-events', '')

  const aVideo = document.createElement('a-video')
  aVideo.setAttribute('src', `#video${id}`)
  aVideo.setAttribute('width', width.toString())
  aVideo.setAttribute('height', height.toString())
  aVideo.setAttribute('position', position)
  aVideo.setAttribute('rotation', rotation)

  entity.appendChild(aVideo)
  scene.appendChild(entity)
})
