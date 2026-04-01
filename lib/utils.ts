import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 5) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res;
    } catch (error) {
      lastError = error;
      console.warn(`Fetch attempt ${i + 1} failed for ${url}. Retrying...`);
      if (i < maxRetries - 1) {
        // Wait before retrying (exponential backoff: 1s, 2s, 4s, 8s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastError;
}

export function parseDiscordEmoji(emojiString: string) {
  if (!emojiString) return null;
  const animatedMatch = emojiString.match(/<a:[^:]+:(\d+)>/);
  if (animatedMatch) {
    return `https://cdn.discordapp.com/emojis/${animatedMatch[1]}.gif`;
  }
  const staticMatch = emojiString.match(/<:[^:]+:(\d+)>/);
  if (staticMatch) {
    return `https://cdn.discordapp.com/emojis/${staticMatch[1]}.png`;
  }
  return null;
}

export function formatVoiceTime(seconds: number) {
  if (!seconds) return '0 ثانية';
  const y = Math.floor(seconds / (3600 * 24 * 365));
  const mo = Math.floor((seconds % (3600 * 24 * 365)) / (3600 * 24 * 30));
  const w = Math.floor((seconds % (3600 * 24 * 30)) / (3600 * 24 * 7));
  const d = Math.floor((seconds % (3600 * 24 * 7)) / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (y > 0) parts.push(`${y} سنة`);
  if (mo > 0) parts.push(`${mo} شهر`);
  if (w > 0) parts.push(`${w} أسبوع`);
  if (d > 0) parts.push(`${d} يوم`);
  if (h > 0) parts.push(`${h} ساعة`);
  if (m > 0) parts.push(`${m} دقيقة`);
  if (s > 0 && parts.length === 0) parts.push(`${s} ثانية`);

  return parts.slice(0, 2).join(' و ');
}

export const formatDateEn = (dateString: any) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export function generateGradientColors(hex: string) {
  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return { primaryColor: hex, secondaryColor: hex, tertiaryColor: hex };
  }
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  
  // Create a slightly lighter color for secondary
  const r2 = Math.min(255, r + 40);
  const g2 = Math.min(255, g + 40);
  const b2 = Math.min(255, b + 40);
  
  // Create a slightly darker color for tertiary
  const r3 = Math.max(0, r - 20);
  const g3 = Math.max(0, g - 20);
  const b3 = Math.max(0, b - 20);

  return {
    primaryColor: hex,
    secondaryColor: `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`,
    tertiaryColor: `#${toHex(r3)}${toHex(g3)}${toHex(b3)}`
  };
}
