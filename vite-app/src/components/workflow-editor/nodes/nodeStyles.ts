export const NODE_ACCENT_COLORS: Record<string, string> = {
  manualTrigger: '#fbbf24',
  webhook: '#fbbf24',
  scheduleTrigger: '#fbbf24',
  httpRequest: '#3b82f6',
  emailSend: '#22c55e',
  set: '#a855f7',
  code: '#a855f7',
  slack: '#e879f9',
  if: '#f97316',
}

export function getAccentColor(n8nType: string): string {
  return NODE_ACCENT_COLORS[n8nType] ?? '#6b7280'
}

export const STATUS_COLORS: Record<string, string> = {
  idle: '#6b7280',
  running: '#fbbf24',
  success: '#22c55e',
  error: '#ef4444',
}
