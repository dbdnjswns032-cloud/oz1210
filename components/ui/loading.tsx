/**
 * @file loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * API 호출이나 데이터 로딩 중 표시하는 스피너입니다.
 * 크기 변형 (sm, md, lg)을 지원합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin text-muted-foreground",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /**
   * 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 텍스트 표시 여부
   */
  text?: string;
}

function Loading({ className, size, text, ...props }: LoadingProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

export { Loading, spinnerVariants };

