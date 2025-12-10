/**
 * @file use-toast.ts
 * @description 토스트 알림 훅
 *
 * 토스트 메시지를 관리하는 커스텀 훅입니다.
 * 전역 상태로 토스트 목록을 관리합니다.
 */

"use client";

import * as React from "react";
import type { ToastProps, ToastVariant } from "@/components/ui/toast";

type Toast = Omit<ToastProps, "onClose">;

interface ToastContextValue {
  toasts: ToastProps[];
  toast: (props: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
  removeAll: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Context Provider
 */
export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastProps = {
        ...props,
        id,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    React.createElement(
      ToastContext.Provider,
      { value: { toasts, toast, remove, removeAll } },
      children
    )
  );
}

/**
 * useToast 훅
 */
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastContextProvider");
  }
  return context;
}

