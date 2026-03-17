import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
