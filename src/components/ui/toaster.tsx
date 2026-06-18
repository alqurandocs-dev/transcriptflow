import { useEffect } from 'react'
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast'
import { useToastState } from '@/hooks/useToast'

export function Toaster() {
  const { toasts, setToasts, register, dismiss } = useToastState()

  useEffect(() => {
    register(setToasts)
  }, [register, setToasts])

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast
          key={id}
          variant={variant}
          onOpenChange={(open) => { if (!open) dismiss(id) }}
          {...props}
        >
          <div className="flex-1 min-w-0">
            <ToastTitle>{title}</ToastTitle>
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
