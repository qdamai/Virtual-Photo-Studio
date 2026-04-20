<script setup>
import { ref, computed, createApp, h } from 'vue'
import { useRouter } from 'vue-router'
import { usePhotoboothStore } from '../store'
import PhotoFrame from '../components/PhotoFrame.vue'
import { Sparkles, Download } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'

const router = useRouter()
const store = usePhotoboothStore()
const frameRef = ref(null)
const isGenerating = ref(false)
const errorMsg = ref(null)

const dynamicScale = computed(() => {
  const cols = store.config.cols
  const rows = store.config.rows
  const maxWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 450) : 400
  const maxHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.7, 700) : 700

  const fWidth = (store.cellWidth * cols) + (10 * (cols - 1)) + 32
  const fHeight = (store.cellHeight * rows) + (10 * (rows - 1)) + 32 + 100
  
  const scaleW = maxWidth / fWidth
  const scaleH = maxHeight / fHeight
  
  return {
    scale: Math.min(scaleW, scaleH, 1),
    width: fWidth,
    height: fHeight
  }
})

// Load an image from a src and return a promise
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // retry without crossOrigin for data URLs
      const img2 = new Image()
      img2.onload = () => resolve(img2)
      img2.onerror = reject
      img2.src = src
    }
    img.src = src
  })
}

// Render a Lucide icon to a canvas-loadable Image via SVG Blob URL
function getLucideIconImage(iconName, color, size) {
  return new Promise((resolve, reject) => {
    const IconComp = LucideIcons[iconName]
    if (!IconComp) return reject(new Error(`Icon not found: ${iconName}`))

    // Mount component to temporary hidden div and read the SVG markup
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.width = `${size}px`
    container.style.height = `${size}px`
    document.body.appendChild(container)

    const app = createApp({ render: () => h(IconComp, { width: size, height: size, color, 'stroke-width': 2 }) })
    app.mount(container)

    // Give Vue one tick to render
    setTimeout(() => {
      const svgEl = container.querySelector('svg')
      if (!svgEl) { app.unmount(); container.remove(); return reject(new Error('No SVG rendered')) }

      // Serialize and use as Blob
      const svgStr = new XMLSerializer().serializeToString(svgEl)
      app.unmount()
      container.remove()

      const blob = new Blob([svgStr], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')) }
      img.src = url
    }, 0)
  })
}

// Apply image filter via pixel manipulation — 100% reliable in ALL browsers.
// ctx.filter CSS property is inconsistent in mobile/production environments.
function applyPixelFilter(imageData, filterName) {
  const d = imageData.data
  const len = d.length

  for (let i = 0; i < len; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]

    if (filterName === 'mono' || filterName === 'grainy') {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      d[i] = d[i + 1] = d[i + 2] = gray

    } else if (filterName === 'sepia' || filterName === 'vintage') {
      const nr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      const ng = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      const nb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
      if (filterName === 'vintage') {
        // vintage = sepia + slight darken
        d[i] = Math.round(nr * 0.9); d[i + 1] = Math.round(ng * 0.9); d[i + 2] = Math.round(nb * 0.9)
      } else {
        d[i] = Math.round(nr); d[i + 1] = Math.round(ng); d[i + 2] = Math.round(nb)
      }

    } else if (filterName === 'retro') {
      // sepia-ish + slight red/yellow tint
      d[i]     = Math.min(255, Math.round(r * 0.5 + g * 0.4 + b * 0.1 + 40))
      d[i + 1] = Math.min(255, Math.round(r * 0.3 + g * 0.5 + b * 0.1 + 20))
      d[i + 2] = Math.min(255, Math.round(r * 0.2 + g * 0.2 + b * 0.5))

    } else if (filterName === 'warm' || filterName === 'golden' || filterName === 'peachy' || filterName === 'sunset') {
      d[i]     = Math.min(255, Math.round(r * 1.15))
      d[i + 1] = Math.min(255, Math.round(g * 1.05))
      d[i + 2] = Math.min(255, Math.round(b * 0.85))

    } else if (filterName === 'cool' || filterName === 'cool-blue') {
      d[i]     = Math.min(255, Math.round(r * 0.88))
      d[i + 1] = Math.min(255, Math.round(g * 0.95))
      d[i + 2] = Math.min(255, Math.round(b * 1.2))

    } else if (filterName === 'bright') {
      d[i]     = Math.min(255, Math.round(r * 1.25))
      d[i + 1] = Math.min(255, Math.round(g * 1.25))
      d[i + 2] = Math.min(255, Math.round(b * 1.25))

    } else if (filterName === 'matte' || filterName === 'fade') {
      // reduce contrast: push toward mid-gray
      d[i]     = Math.round(r * 0.85 + 20)
      d[i + 1] = Math.round(g * 0.85 + 20)
      d[i + 2] = Math.round(b * 0.85 + 20)

    } else if (filterName === 'cinematic' || filterName === 'high-contrast') {
      // high contrast + slight desaturate
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      d[i]     = Math.min(255, Math.round((r - gray) * 0.7 + gray * 1.35))
      d[i + 1] = Math.min(255, Math.round((g - gray) * 0.7 + gray * 1.35))
      d[i + 2] = Math.min(255, Math.round((b - gray) * 0.7 + gray * 1.35))

    } else if (filterName === 'soft' || filterName === 'dreamy' || filterName === 'pastel') {
      // desaturate + brighten
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      d[i]     = Math.min(255, Math.round(r * 0.6 + gray * 0.4 + 15))
      d[i + 1] = Math.min(255, Math.round(g * 0.6 + gray * 0.4 + 15))
      d[i + 2] = Math.min(255, Math.round(b * 0.6 + gray * 0.4 + 15))
    }
    // 'none' or unknown: no change
  }
  return imageData
}

// Draw a photo with pixel-level filter applied — guaranteed cross-browser.
async function drawPhotoWithFilter(mainCtx, img, sx, sy, sw, sh, dx, dy, dw, dh, filterName) {
  // 1. Draw cropped photo to offscreen canvas
  const off = document.createElement('canvas')
  off.width = dw
  off.height = dh
  const offCtx = off.getContext('2d')
  offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)

  // 2. Apply pixel filter if needed
  if (filterName && filterName !== 'none') {
    try {
      const imageData = offCtx.getImageData(0, 0, dw, dh)
      applyPixelFilter(imageData, filterName)
      offCtx.putImageData(imageData, 0, 0)
    } catch (e) {
      console.warn('Pixel filter failed, drawing unfiltered:', e)
    }
  }

  // 3. Draw filtered result to main canvas
  mainCtx.save()
  mainCtx.beginPath()
  mainCtx.rect(dx, dy, dw, dh)
  mainCtx.clip()
  mainCtx.drawImage(off, dx, dy)
  mainCtx.restore()
}

// Helper: draw an SVG string as a tiled pattern across the canvas
async function tileSvgPattern(ctx, svgStr, tileW, tileH, canvasW, canvasH) {
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      for (let ty = 0; ty < canvasH; ty += tileH) {
        for (let tx = 0; tx < canvasW; tx += tileW) {
          ctx.drawImage(img, tx, ty, tileW, tileH)
        }
      }
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve() }
    img.src = url
  })
}

// Draw all 19 pattern types onto the canvas — matches PatternBackground.vue visually
async function drawCanvasPattern(ctx, pattern, frameW, frameH) {
  if (!pattern || pattern === 'none') return

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.roundRect(0, 0, frameW, frameH, 16)
  ctx.clip()
  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.strokeStyle = 'rgba(255,255,255,1)'

  const W = frameW, H = frameH

  if (pattern === 'dots') {
    for (let dy = 10; dy < H; dy += 20) {
      for (let dx = 10; dx < W; dx += 20) {
        ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill()
      }
    }
  } else if (pattern === 'dots-lg') {
    for (let dy = 15; dy < H; dy += 30) {
      for (let dx = 15; dx < W; dx += 30) {
        ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill()
      }
    }
  } else if (pattern === 'grid') {
    ctx.lineWidth = 1
    for (let gx = 0; gx < W; gx += 20) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
    for (let gy = 0; gy < H; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke() }
  } else if (pattern === 'stripes') {
    ctx.lineWidth = 2
    for (let i = -H; i < W + H; i += 10) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
    }
  } else if (pattern === 'v-stripes') {
    for (let gx = 0; gx < W; gx += 20) { ctx.fillRect(gx, 0, 10, H) }
  } else if (pattern === 'h-stripes') {
    for (let gy = 0; gy < H; gy += 20) { ctx.fillRect(0, gy, W, 10) }
  } else if (pattern === 'diagonal-thin') {
    ctx.lineWidth = 1
    for (let i = -H; i < W + H; i += 8) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
    }
  } else if (pattern === 'checkered-sm' || pattern === 'gingham') {
    const sz = 16
    for (let row = 0; row * sz < H; row++) {
      for (let col = 0; col * sz < W; col++) {
        if ((row + col) % 2 === 0) ctx.fillRect(col * sz, row * sz, sz, sz)
      }
    }
  } else if (pattern === 'zigzag') {
    ctx.lineWidth = 2
    const zSize = 25
    for (let gy = 0; gy < H; gy += zSize) {
      ctx.beginPath()
      for (let gx = 0; gx < W; gx += zSize) {
        const yOff = (Math.floor(gx / zSize) % 2 === 0) ? gy : gy + zSize / 2
        if (gx === 0) ctx.moveTo(gx, yOff); else ctx.lineTo(gx, yOff)
      }
      ctx.stroke()
    }
  } else if (pattern === 'waves') {
    ctx.lineWidth = 1.5
    for (let gy = 10; gy < H; gy += 20) {
      ctx.beginPath()
      for (let gx = 0; gx < W; gx += 1) {
        const y = gy + Math.sin(gx / 8) * 4
        if (gx === 0) ctx.moveTo(gx, y); else ctx.lineTo(gx, y)
      }
      ctx.stroke()
    }
  } else if (pattern === 'bubbles') {
    for (let dy = 20; dy < H; dy += 40) {
      for (let dx = 20; dx < W; dx += 40) {
        ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(dx + 20, dy + 20, 2, 0, Math.PI * 2); ctx.fill()
      }
    }
  } else if (pattern === 'crosses') {
    for (let dy = 10; dy < H; dy += 20) {
      for (let dx = 10; dx < W; dx += 20) {
        ctx.fillRect(dx - 5, dy - 1, 10, 2)
        ctx.fillRect(dx - 1, dy - 5, 2, 10)
      }
    }
  } else if (pattern === 'hexagon') {
    const hW = 40, hH = 35
    ctx.lineWidth = 1
    for (let row = 0; row * hH < H + hH; row++) {
      for (let col = 0; col * hW < W + hW; col++) {
        const xOff = row % 2 === 0 ? 0 : hW / 2
        const cx2 = col * hW + xOff, cy2 = row * hH
        ctx.beginPath()
        for (let a = 0; a < 6; a++) {
          const angle = (Math.PI / 3) * a - Math.PI / 6
          const px = cx2 + 18 * Math.cos(angle), py = cy2 + 18 * Math.sin(angle)
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath(); ctx.stroke()
      }
    }
  } else if (pattern === 'abstract') {
    const drawBlob = (bx, by, r) => {
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, r)
      g.addColorStop(0, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'rgba(255,255,255,1)'
    drawBlob(W * 0.1, H * 0.15, Math.min(W, H) * 0.45)
    drawBlob(W * 0.9, H * 0.85, Math.min(W, H) * 0.45)
    drawBlob(W * 0.5, H * 0.5, Math.min(W, H) * 0.2)

  // SVG-based symbol patterns
  } else if (pattern === 'hearts-sm') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`, 32, 32, W, H)
  } else if (pattern === 'sparkles') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 1L9 9L1 12L9 15L12 23L15 15L23 12L15 9L12 1Z"/></svg>`, 24, 24, W, H)
  } else if (pattern === 'flowers') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="6" rx="3" ry="4"/><ellipse cx="12" cy="18" rx="3" ry="4"/><ellipse cx="6" cy="12" rx="4" ry="3"/><ellipse cx="18" cy="12" rx="4" ry="3"/></svg>`, 40, 40, W, H)
  } else if (pattern === 'smileys') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="white"/><circle cx="15" cy="9" r="1" fill="white"/></svg>`, 36, 36, W, H)
  } else if (pattern === 'cherries') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white"><circle cx="6" cy="18" r="4"/><circle cx="18" cy="18" r="4"/><path d="M6 14 Q12 4 18 14" fill="none" stroke="white" stroke-width="2"/></svg>`, 40, 40, W, H)
  } else if (pattern === 'clouds') {
    await tileSvgPattern(ctx, `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="32" viewBox="0 0 50 32" fill="white"><ellipse cx="25" cy="24" rx="18" ry="8"/><circle cx="16" cy="20" r="8"/><circle cx="30" cy="16" r="10"/><circle cx="22" cy="14" r="8"/></svg>`, 50, 32, W, H)
  }

  ctx.restore()
}

async function generateFinal() {
  if (isGenerating.value) return
  isGenerating.value = true
  errorMsg.value = null

  try {
    const gap = 10
    const pad = 16
    const cols = store.config.cols
    const rows = store.config.rows
    const cw = store.cellWidth
    const ch = store.cellHeight
    const footerH = 100

    const frameW = (cw * cols) + (gap * (cols - 1)) + (pad * 2)
    const frameH = (ch * rows) + (gap * (rows - 1)) + (pad * 2) + footerH

    const scale = 2 // output resolution multiplier
    const canvas = document.createElement('canvas')
    canvas.width = frameW * scale
    canvas.height = frameH * scale
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    // --- 1. Draw background (handle solid colors AND gradients) ---
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(0, 0, frameW, frameH, 16)
    ctx.clip()

    const colorVal = store.config.color || '#ffffff'
    if (colorVal.includes('gradient')) {
      // Parse linear-gradient to CanvasGradient
      // e.g. "linear-gradient(135deg, #f5d0fe, #c4b5fd)"
      const stops = colorVal.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || ['#ffffff', '#eeeeee']
      const angleMatch = colorVal.match(/(\d+)deg/)
      const angle = angleMatch ? parseInt(angleMatch[1]) : 135
      const rad = (angle * Math.PI) / 180
      const x1 = frameW / 2 - Math.cos(rad) * frameW / 2
      const y1 = frameH / 2 - Math.sin(rad) * frameH / 2
      const x2 = frameW / 2 + Math.cos(rad) * frameW / 2
      const y2 = frameH / 2 + Math.sin(rad) * frameH / 2
      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      stops.forEach((stop, i) => {
        grad.addColorStop(i / (stops.length - 1), stop)
      })
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = colorVal
    }
    ctx.fillRect(0, 0, frameW, frameH)
    ctx.restore()

    // --- 1b. Draw pattern overlay — covers all 19 pattern types ---
    await drawCanvasPattern(ctx, store.config.pattern, frameW, frameH)

    // --- 2. Draw photos grid ---
    const photos = store.capturedPhotos
    let photoIdx = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cw + gap)
        const y = pad + r * (ch + gap)

        // Black cell background
        ctx.fillStyle = '#000000'
        ctx.fillRect(x, y, cw, ch)

        const src = photos[photoIdx]
        if (src) {
          try {
            const img = await loadImage(src)
            const filterName = store.config.filter || 'none'

            // Center-crop the source image into the cell aspect ratio
            const imgAspect = img.naturalWidth / img.naturalHeight
            const cellAspect = cw / ch
            let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
            if (imgAspect > cellAspect) {
              sw = img.naturalHeight * cellAspect
              sx = (img.naturalWidth - sw) / 2
            } else {
              sh = img.naturalWidth / cellAspect
              sy = (img.naturalHeight - sh) / 2
            }

            // Use offscreen canvas to apply filter — reliable across all browsers
            await drawPhotoWithFilter(ctx, img, sx, sy, sw, sh, x, y, cw, ch, filterName)
          } catch(e) {
            console.warn('Could not draw photo', e)
          }
        }
        photoIdx++
      }
    }

    // --- 3. Draw stickers ---
    for (const sticker of (store.config.stickers || [])) {
      ctx.save()
      ctx.translate(sticker.x, sticker.y)
      ctx.rotate(((sticker.rotation || 0) * Math.PI) / 180)
      const stickerScale = sticker.scale || 1

      if (sticker.type === 'image' && sticker.src) {
        try {
          // Build absolute URL so canvas can load it in production
          const absUrl = sticker.src.startsWith('http') 
            ? sticker.src 
            : `${window.location.origin}${sticker.src.startsWith('/') ? '' : '/'}${sticker.src}`
          const img = await loadImage(absUrl)
          const sSize = 128 * stickerScale
          ctx.drawImage(img, -sSize / 2, -sSize / 2, sSize, sSize)
        } catch(e) { 
          console.warn('Sticker image load failed:', sticker.src, e)
        }

      } else if (sticker.type === 'icon' && sticker.src) {
        // Render Lucide icon via Vue mount → SVG → Blob → Image → Canvas
        try {
          const color = sticker.color || '#ffffff'
          const iconSize = Math.round(48 * stickerScale)
          const img = await getLucideIconImage(sticker.src, color, iconSize)
          ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize)
        } catch(e) { 
          console.warn('Icon sticker failed:', sticker.src, e)
        }

      } else if (sticker.type === 'emoji' || (typeof sticker.src === 'string')) {
        // Emoji or text sticker
        const emojiSize = 48 * stickerScale
        ctx.font = `${emojiSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = sticker.color || '#000000'
        ctx.fillText(sticker.src, 0, 0)
      }

      ctx.restore()
    }

    // --- 4. Draw footer text ---
    const footerY = pad + rows * ch + (rows - 1) * gap
    if (store.config.text) {
      const fontSize = store.config.fontSize || 48
      ctx.font = `900 ${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (store.config.textGradient && store.config.textGradient.includes('gradient')) {
        // Parse text gradient same way as background
        const stops = store.config.textGradient.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [store.config.textColor || '#000']
        const txtGrad = ctx.createLinearGradient(0, footerY + 16, frameW, footerY + 16 + fontSize)
        stops.forEach((stop, i) => {
          txtGrad.addColorStop(i / Math.max(stops.length - 1, 1), stop)
        })
        ctx.fillStyle = txtGrad
      } else {
        ctx.fillStyle = store.config.textColor || '#000000'
      }
      ctx.fillText(store.config.text, frameW / 2, footerY + (footerH * 0.38))
    }

    // ─── WATERMARK (PERMANENT — BAKED INTO PNG) ───────────────────────
    // Double-layer: dark shadow + light text → visible on ANY background
    const wmText = 'dame-snap.vercel.app'
    const wmY = footerY + (footerH * 0.78)

    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 11px sans-serif'

    // Layer 1 — dark shadow (readable on light bg)
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillText(wmText, frameW / 2 + 0.5, wmY + 0.5)

    // Layer 2 — white text (readable on dark bg)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(wmText, frameW / 2, wmY)

    ctx.restore()
    // ──────────────────────────────────────────────────────────────────

    // --- 5. Export ---
    store.finalImage = canvas.toDataURL('image/png')

    setTimeout(() => {
      isGenerating.value = false
      router.push({ name: 'download' })
    }, 800)

  } catch (err) {
    console.error('Canvas generation error:', err)
    errorMsg.value = 'Gagal memproses foto. Coba lagi.'
    isGenerating.value = false
  }
}

function getFilterStyle(filter) {
  const filters = {
    vintage: 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)',
    retro: 'sepia(0.3) saturate(1.4) contrast(1.2)',
    mono: 'grayscale(1) contrast(1.2) brightness(1.1)',
    sepia: 'sepia(0.8) contrast(1.05)',
    warm: 'saturate(1.3) sepia(0.2) brightness(1.05)',
    cool: 'hue-rotate(30deg) saturate(1.1) brightness(1.05)',
    bright: 'brightness(1.25) contrast(1.05) saturate(1.1)',
    matte: 'contrast(0.85) brightness(1.1) saturate(0.9)',
    pastel: 'brightness(1.15) saturate(0.7) contrast(0.9)',
    cinematic: 'contrast(1.3) saturate(0.8) brightness(0.9)',
  }
  return filters[filter] || 'none'
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-10">
    <div class="text-center space-y-4">
      <h2 class="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none transition-all hover:scale-105">
        Simpan Hasil <span class="text-primary tracking-tighter italic underline decoration-secondary/30">Foto</span>
      </h2>
      <p class="text-slate-500 font-medium tracking-tight px-6 leading-relaxed max-w-2xl mx-auto">
        Yeay! Foto kamu sudah jadi. Pastikan semuanya sudah sesuai sebelum kami proses ke resolusi tinggi (<span class="text-primary font-bold">Ultra-HD</span>).
      </p>
    </div>

    <!-- Desktop: items-center ensures both columns are vertically centered -->
    <div class="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 pt-8">
      
      <!-- High-Res Mockup -->
      <div 
        class="relative flex items-center justify-center shrink-0"
        :style="{ width: `${dynamicScale.width * dynamicScale.scale}px`, height: `${dynamicScale.height * dynamicScale.scale}px` }"
      >
         <!-- Aura -->
         <div class="absolute -inset-10 bg-gradient-to-tr from-primary/10 via-secondary/10 to-transparent blur-[80px] opacity-0 group-hover/mockup:opacity-100 transition-all duration-1000"></div>
         
        <div 
          id="scaling-wrapper"
          class="absolute top-0 left-0 transition-all duration-700 z-10"
          :style="{ transform: `scale(${dynamicScale.scale})`, transformOrigin: 'top left' }"
        >
          <PhotoFrame 
            :photos="store.capturedPhotos" 
            class="relative z-10" 
            :style="{ boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.2)' }"
          />
            
            <!-- Generate Status Overlay -->
            <transition name="fade">
              <div v-if="isGenerating" class="absolute inset-0 bg-slate-900/80 backdrop-blur-xl rounded-[16px] flex flex-col items-center justify-center p-8 text-center z-50 text-white">
                 <div class="w-20 h-20 relative mb-4">
                    <div class="absolute inset-0 border-8 border-white/20 rounded-full"></div>
                    <div class="absolute inset-0 border-8 border-primary rounded-full animate-spin border-t-transparent"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                       <Sparkles class="w-8 h-8 animate-pulse text-primary" />
                    </div>
                 </div>
                 <h3 class="text-xl font-black tracking-tight mb-2 uppercase italic">Memproses...</h3>
                 <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Mohon tunggu sebentar.</p>
              </div>
            </transition>
         </div>
      </div>

      <!-- Action Panel -->
      <div class="flex flex-col gap-6 w-full max-w-sm shrink-0">
          <div class="bg-white p-8 md:p-10 rounded-[48px] shadow-2xl border-4 border-slate-50 flex flex-col gap-8 relative overflow-hidden group/panel transition-all hover:bg-slate-50/50">
             <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover/panel:scale-150 transition-transform"></div>
             
             <div class="space-y-3 relative z-10 transition-transform duration-500 group-hover/panel:translate-x-1 text-center md:text-left">
                <h3 class="text-2xl font-black text-slate-800 tracking-tight leading-tight">Siap Untuk <br><span class="text-secondary tracking-tighter uppercase italic">Disimpan?</span></h3>
                <p class="text-slate-400 font-bold text-xs leading-relaxed tracking-wide">Jika sudah pas, klik tombol di bawah untuk mengunduh fotomu.</p>
             </div>

             <div class="flex flex-col gap-4 relative z-10">
                <!-- Error Message -->
              <p v-if="errorMsg" class="text-red-500 font-bold text-xs text-center">{{ errorMsg }}</p>

              <button 
                @click="generateFinal"
                :disabled="isGenerating"
                class="group w-full flex items-center justify-between px-8 py-5 bg-primary text-white rounded-[24px] font-black text-lg transition-all hover:bg-slate-900 active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
                >
                   <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-full transition-all duration-1000 skew-x-[-20deg]"></div>
                   <span class="relative z-10 text-sm tracking-widest uppercase">UNDUH FOTO</span>
                   <Download class="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
             </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
