/**
 * @file toast-provider.tsx
 * @description Toast Provider 컴포넌트
 *
 * ToastProvider와 ToastContainer를 함께 제공하는 컴포넌트입니다.
 * app/layout.tsx에서 사용됩니다.
 */

"use client";

import { ToastContextProvider, useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

function ToastContainerWrapper() {
  const { toasts, remove } = useToast();
  return <ToastContainer toasts={toasts} onRemove={remove} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContextProvider>
      {children}
      <ToastContainerWrapper />
    </ToastContextProvider>
  );
}

