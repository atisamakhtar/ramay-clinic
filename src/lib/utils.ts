import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM dd, yyyy');
  }
  return format(date, 'MMM dd, yyyy');
}

export function formatDateWithTime(date: string | Date): string {
  if (typeof date === 'string') {
    return format(parseISO(date), 'MMM dd, yyyy HH:mm');
  }
  return format(date, 'MMM dd, yyyy HH:mm');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function calculateDaysRemaining(dateStr: string): number {
  const date = parseISO(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: string, thresholdDays = 30): boolean {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  return daysRemaining > 0 && daysRemaining <= thresholdDays;
}

export function isExpired(expiryDate: string): boolean {
  return calculateDaysRemaining(expiryDate) <= 0;
}

export function isLowStock(quantity: number, reorderLevel: number): boolean {
  return quantity <= reorderLevel;
}