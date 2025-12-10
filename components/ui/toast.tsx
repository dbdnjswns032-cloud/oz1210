/**
 * @file toast.tsx
 * @description 토스트 알림 컴포넌트
 *
 * 사용자에게 알림 메시지를 표시하는 토스트 컴포넌트입니다.
 * shadcn/ui 스타일을 따르며, 간단한 토스트 시스템을 구현합니다.
 *
 * 참고: 향후 sonner나 react-hot-toast 같은 라이브러리로 교체 가능
 */

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

const toastVariants: Record<ToastVariant, string> = {
  default: "bg-background border-border",
  success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
};

const toastIconColors: Record<ToastVariant, string> = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
};

function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 3000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-lg border p-4 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-80",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
        toastVariants[variant]
      )}
      role="alert"
    >
      <div className="flex-1 space-y-1">
        {title && (
          <div className={cn("text-sm font-semibold", toastIconColors[variant])}>
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 shrink-0 opacity-70 transition-opacity hover:opacity-100",
            "group-hover:opacity-100"
          )}
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Toast 컨테이너 컴포넌트
 */
export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

export { Toast, ToastContainer };

