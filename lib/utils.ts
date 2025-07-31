import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function calculateROI(timeSavedHours: number, hourlyRate = 25): number {
  return timeSavedHours * hourlyRate
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "success":
      return "text-green-600"
    case "error":
      return "text-red-600"
    case "inactive":
      return "text-gray-500"
    case "running":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}