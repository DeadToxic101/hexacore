import si from 'systeminformation'
import type { ResourceStats } from '@shared/types'

let lastNet: { rx: number; tx: number; t: number } | null = null
let fps = 60

// FPS is reported by the renderer's requestAnimationFrame loop; store latest here.
export function setFps(v: number): void {
  fps = v
}

export async function sampleResources(): Promise<ResourceStats> {
  const [load, mem, gpu, net, temp] = await Promise.all([
    si.currentLoad().catch(() => null),
    si.mem().catch(() => null),
    si.graphics().catch(() => null),
    si.networkStats().catch(() => null),
    si.cpuTemperature().catch(() => null)
  ])

  const primaryGpu = gpu?.controllers?.find((c) => c.utilizationGpu != null) ?? gpu?.controllers?.[0]

  let netDown = 0
  let netUp = 0
  if (net && net[0]) {
    const now = Date.now()
    const { rx_bytes, tx_bytes } = net[0] as any
    if (lastNet) {
      const dt = (now - lastNet.t) / 1000
      netDown = Math.max(0, (rx_bytes - lastNet.rx) / 1024 / dt)
      netUp = Math.max(0, (tx_bytes - lastNet.tx) / 1024 / dt)
    }
    lastNet = { rx: rx_bytes, tx: tx_bytes, t: now }
  }

  return {
    cpu: load ? Math.round(load.currentLoad) : 0,
    cpuTemp: temp?.main && temp.main > 0 ? Math.round(temp.main) : null,
    ramUsed: mem ? Math.round((mem.total - mem.available) / 1024 / 1024) : 0,
    ramTotal: mem ? Math.round(mem.total / 1024 / 1024) : 0,
    gpu: primaryGpu?.utilizationGpu != null ? Math.round(primaryGpu.utilizationGpu) : 0,
    gpuMem: primaryGpu?.memoryUsed && primaryGpu?.memoryTotal
      ? Math.round((primaryGpu.memoryUsed / primaryGpu.memoryTotal) * 100)
      : 0,
    gpuTemp: primaryGpu?.temperatureGpu ? Math.round(primaryGpu.temperatureGpu) : null,
    netDown: Math.round(netDown),
    netUp: Math.round(netUp),
    fps
  }
}
