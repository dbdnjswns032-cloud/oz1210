/**
 * @file detail-gallery.tsx
 * @description 관광지 상세 이미지 갤러리 컴포넌트
 *
 * 공공 API(detailImage2)에서 받아온 이미지들을 슬라이더와 썸네일 리스트로 보여주며,
 * Dialog를 통해 확대 모달을 제공합니다.
 *
 * @see {@link docs/PRD.md} 2.4.3장 - 이미지 갤러리
 */

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import type { TourImage } from "@/lib/types/tour";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DetailGalleryProps {
  title: string;
  images: TourImage[];
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23e5e7eb' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E이미지 없음%3C/text%3E%3C/svg%3E";

function pickImageUrl(image: TourImage): string | undefined {
  return image.originimgurl || image.smallimageurl;
}

export function DetailGallery({ title, images }: DetailGalleryProps) {
  const validImages = useMemo(
    () => images.map((img) => ({ ...img, url: pickImageUrl(img) })).filter((img) => img.url),
    [images]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (validImages.length === 0) {
    return null;
  }

  const currentImage = validImages[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  return (
    <section className="border rounded-lg p-6 bg-card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">이미지 갤러리</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            aria-label="이전 이미지"
            disabled={validImages.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            aria-label="다음 이미지"
            disabled={validImages.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="이미지 확대 보기">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <Image
                  src={currentImage.url ?? PLACEHOLDER_IMAGE}
                  alt={currentImage.imagename || title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain bg-black/5"
                />
              </div>
              <div className="flex items-center justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 mr-1" />
                  닫기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
        <Image
          key={currentImage.url}
          src={currentImage.url ?? PLACEHOLDER_IMAGE}
          alt={currentImage.imagename || title}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
          priority={currentIndex === 0}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto py-1">
        {validImages.map((img, index) => (
          <button
            key={`${img.serialnum ?? img.url}-${index}`}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative h-20 w-28 shrink-0 overflow-hidden rounded-md border transition",
              index === currentIndex ? "border-primary ring-2 ring-primary/30" : "border-border"
            )}
            aria-label={`이미지 ${index + 1} 선택`}
          >
            <Image
              src={img.url ?? PLACEHOLDER_IMAGE}
              alt={img.imagename || `${title} 이미지 ${index + 1}`}
              fill
              sizes="150px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

