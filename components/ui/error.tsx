/**
 * @file error.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러나 예외 상황을 사용자에게 표시하는 컴포넌트입니다.
 * 재시도 버튼을 포함할 수 있습니다.
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 상세 설명
   */
  description?: string;
  /**
   * 재시도 버튼 표시 여부
   */
  showRetry?: boolean;
  /**
   * 재시도 버튼 클릭 핸들러
   */
  onRetry?: () => void;
  /**
   * 재시도 버튼 텍스트
   * @default "다시 시도"
   */
  retryText?: string;
}

function Error({
  className,
  message = "오류가 발생했습니다",
  description,
  showRetry = false,
  onRetry,
  retryText = "다시 시도",
  ...props
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 text-center",
        className
      )}
      {...props}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      )}
    </div>
  );
}

export { Error };

