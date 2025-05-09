
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      offset={80} // Position above bottom navigation
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        duration: 2000,
      }}
      {...props}
    />
  )
}

// Create a deduplication mechanism with a map of active toasts
let activeToasts = new Map();

// Create a custom toast function that applies consistent styling and positioning
// and prevents duplicate toasts
const showToast = (message: string, options?: any) => {
  // Create a key from the message and description (if any)
  const key = `${message}-${options?.description || ''}`;
  
  // If this toast is already active, don't show it again
  if (activeToasts.has(key)) {
    return;
  }
  
  // Add the toast to active toasts
  activeToasts.set(key, true);
  
  // Show the toast with the Sonner library
  const toastId = Sonner.toast(message, {
    position: "bottom-center",
    duration: 2000,
    ...options,
    onDismiss: () => {
      // Remove from active toasts when dismissed
      activeToasts.delete(key);
      // Call the original onDismiss if provided
      if (options?.onDismiss) options.onDismiss();
    }
  });
  
  // Return the toast ID for potential programmatic dismissal
  return toastId;
};

// Export the modified toast function
export { Toaster, showToast as toast }
