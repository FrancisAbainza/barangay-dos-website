import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { XIcon, Upload } from "lucide-react";

export type ImageItem = {
  uri: File | string;
  path?: string;
};

interface MultiImageUploaderProps {
  onImagesChange: (images: ImageItem[]) => void;
  images: ImageItem[];
  mode?: "single" | "multi";
}

export default function MultiImageUploader({ onImagesChange, images, mode = "multi" }: MultiImageUploaderProps) {
  const isSingle = mode === "single";

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    if (isSingle) {
      onImagesChange([{ uri: acceptedFiles[0] }]);
      return;
    }

    const newImages: ImageItem[] = acceptedFiles.map((file) => ({ uri: file }));
    onImagesChange([...images, ...newImages]);
  }, [images, onImagesChange, isSingle]);

  const handleDelete = (deletedImageIndex: number) => {
    const updatedImages = images.filter((_, index) => index !== deletedImageIndex);
    onImagesChange(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: !isSingle,
  });

  const showDropzone = !isSingle || images.length === 0;

  return (
    <div>
      {showDropzone && (
        <div
          {...getRootProps()}
          className="border-dashed border-2 p-6 text-center cursor-pointer rounded-lg hover:border-primary hover:bg-accent transition-all"
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the image{!isSingle ? "s" : ""} here ...</p>
          ) : (
            <p>Drag & drop {isSingle ? "an image" : "images"} here, or click to select</p>
          )}
        </div>
      )}

      <div>
        {images.map((image, index) => (
          <div key={index} className="flex items-center gap-3 border rounded-md shadow-xs overflow-hidden mt-3 pr-3">
            <div className="relative size-16">
              <Image
                src={image.uri instanceof File ? URL.createObjectURL(image.uri) : image.uri}
                alt="post image"
                fill
                sizes="100%"
                className="object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden py-3">
              <p className="break-all">{isSingle ? "Selected Image" : `Image ${index + 1}`}</p>
              {!isSingle && index === 0 && (
                <Badge variant={"outline"}>Featured Image</Badge>
              )}
            </div>
            <button type="button" onClick={() => handleDelete(index)}>
              <XIcon className="text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
