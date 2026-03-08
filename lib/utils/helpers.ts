// Utility functions for the application

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Get platform icon/emoji
 */
export function getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
        discord: '💬',
        reddit: '🔴',
        telegram: '✈️',
        directory: '📁',
        website: '🌐',
        other: '📌',
    };
    return icons[platform] || icons.other;
}

/**
 * Get platform color
 */
export function getPlatformColor(platform: string): string {
    const colors: Record<string, string> = {
        discord: 'from-indigo-500 to-blue-500',
        reddit: 'from-orange-500 to-red-500',
        telegram: 'from-blue-400 to-cyan-400',
        directory: 'from-purple-500 to-pink-500',
        website: 'from-green-500 to-emerald-500',
        other: 'from-gray-500 to-slate-500',
    };
    return colors[platform] || colors.other;
}

/**
 * Get activity level color
 */
export function getActivityColor(level: string): string {
    const colors: Record<string, string> = {
        high: 'text-green-400',
        medium: 'text-yellow-400',
        low: 'text-gray-400',
    };
    return colors[level] || colors.low;
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
