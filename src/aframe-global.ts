// src/aframe-global.ts
import * as AFRAME from 'aframe'

// 👇 Esto expone AFRAME antes de que MindAR lo necesite
;(window as any).AFRAME = AFRAME
