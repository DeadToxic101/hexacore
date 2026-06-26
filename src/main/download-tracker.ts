import type { DownloadItem as ElectronDownloadItem } from 'electron'

export const liveDownloads = new Map<string, ElectronDownloadItem>()
