
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

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

// Override toast function to apply consistent positioning
const showToast = toast;

// Create a custom toast function that applies consistent styling and positioning
const customToast = (message: string, options?: any) => {
  return showToast(message, {
    position: "bottom-center",
    duration: 2000,
    ...options,
  });
};

// Export the modified toast function
export { Toaster, customToast as toast }
