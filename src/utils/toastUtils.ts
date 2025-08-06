
import { toast } from '@/hooks/use-toast';

// Track active toasts to prevent duplicates
const activeToasts = new Set<string>();

// Debounce function to prevent rapid duplicate calls
const debounceTimeouts = new Map<string, NodeJS.Timeout>();

export const showToast = (options: {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}) => {
  const key = `${options.title}-${options.description || ''}`;
  
  // Clear existing timeout for this toast
  const existingTimeout = debounceTimeouts.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Don't show if already active
  if (activeToasts.has(key)) {
    return;
  }
  
  // Add to active toasts
  activeToasts.add(key);
  
  // Show the toast using the correct API
  const toastResult = toast({
    title: options.title,
    description: options.description,
    variant: options.variant,
  });
  
  // Remove from active toasts after duration
  const duration = options.duration || 3000;
  const timeout = setTimeout(() => {
    activeToasts.delete(key);
    debounceTimeouts.delete(key);
  }, duration);
  
  debounceTimeouts.set(key, timeout);
  
  return toastResult;
};

// Clear all active toasts (useful for cleanup)
export const clearActiveToasts = () => {
  activeToasts.clear();
  debounceTimeouts.forEach(timeout => clearTimeout(timeout));
  debounceTimeouts.clear();
};
