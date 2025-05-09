
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="max-w-[300px] w-fit min-h-0 py-2 px-3">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-sm">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      {/* Position toasts just above the bottom navigation, centered horizontally */}
      <ToastViewport className="bottom-16 flex flex-col p-4 gap-2 w-full max-w-[320px] m-0 left-1/2 transform -translate-x-1/2" />
    </ToastProvider>
  )
}
