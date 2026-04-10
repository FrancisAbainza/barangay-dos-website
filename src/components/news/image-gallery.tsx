"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/components/media-uploader";

export function MediaGallery({ media }: { media: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = media.length;

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
        {media.slice(0, 4).map((item, i) => (
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
            {item.type === "video" ? (
              <>
                <video
                  src={item.uri as string}
                  preload="metadata"
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <Play className="size-10 text-white drop-shadow-md fill-white" />
                </div>
              </>
            ) : (
              <Image
                src={item.uri as string}
                alt={`Post image ${i + 1}`}
                fill
                className="object-cover hover:brightness-90 transition-[filter]"
                unoptimized
              />
            )}
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
          className="sm:max-w-3xl p-0 overflow-hidden bg-black border-0 gap-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Media viewer</DialogTitle>
          {lightboxIndex !== null && (
            <div className="relative flex items-center justify-center w-full min-h-[40vh] max-h-[85vh]">
              {media[lightboxIndex].type === "video" ? (
                <video
                  src={media[lightboxIndex].uri as string}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media[lightboxIndex].uri as string}
                  alt={`Media ${lightboxIndex + 1} of ${media.length}`}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              )}
              {media.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-2 text-white hover:bg-white/20 z-10"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i === null
                          ? 0
                          : (i - 1 + media.length) % media.length
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
                        i === null ? 0 : (i + 1) % media.length
                      )
                    }
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
              <span className="absolute bottom-3 right-3 text-white text-sm bg-black/50 px-2 py-0.5 rounded-full">
                {lightboxIndex + 1} / {media.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-white bg-black/20 hover:bg-black/30 hover:text-white z-10"
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
