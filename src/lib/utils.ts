import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'gerade eben';
  } else if (diffInMinutes < 60) {
    return `vor ${diffInMinutes} Minute${diffInMinutes !== 1 ? 'n' : ''}`;
  } else if (diffInHours < 24) {
    return `vor ${diffInHours} Stunde${diffInHours !== 1 ? 'n' : ''}`;
  } else if (diffInDays < 30) {
    return `vor ${diffInDays} Tag${diffInDays !== 1 ? 'en' : ''}`;
  } else if (diffInMonths < 12) {
    return `vor ${diffInMonths} Monat${diffInMonths !== 1 ? 'en' : ''}`;
  } else {
    return `vor ${diffInYears} Jahr${diffInYears !== 1 ? 'en' : ''}`;
  }
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
