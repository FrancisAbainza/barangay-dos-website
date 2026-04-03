"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images }: { images: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = images.length;

  const gridClass =
    count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2";

  return (
    <>
      <div
        className={cn(
          "grid gap-0.5 mt-3 rounded-lg overflow-hidden",
          gridClass
        )}
      >
        {images.slice(0, 4).map((src, i) => (
          <div
            key={i}
            className={cn(
              "relative cursor-pointer bg-muted overflow-hidden",
              count === 1 ? "aspect-video" : "aspect-square",
              count === 3 && i === 0
                ? "row-span-2 col-span-1 aspect-auto min-h-40"
                : ""
            )}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={src}
              alt={`Post image ${i + 1}`}
              fill
              className="object-cover hover:brightness-90 transition-[filter]"
              unoptimized
            />
            {i === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  +{count - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={() => setLightboxIndex(null)}
      >
        <DialogContent
          className="max-w-3xl p-0 overflow-hidden bg-black border-0 gap-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Image viewer</DialogTitle>
          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <Image
                src={images[lightboxIndex]}
                alt={`Image ${lightboxIndex + 1} of ${images.length}`}
                fill
                className="object-contain"
                unoptimized
              />
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 text-white hover:bg-white/20 z-10"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i === null
                          ? 0
                          : (i - 1 + images.length) % images.length
                      )
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 text-white hover:bg-white/20 z-10"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i === null ? 0 : (i + 1) % images.length
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
              <span className="absolute bottom-3 right-3 text-white text-sm bg-black/50 px-2 py-0.5 rounded-full">
                {lightboxIndex + 1} / {images.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
                onClick={() => setLightboxIndex(null)}
              >
                ✕
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
