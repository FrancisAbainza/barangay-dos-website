import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { XIcon, Upload } from "lucide-react";

export type ImageItem = {
  uri: File | string;
  path?: string;
} | null;

interface SingleImageUploaderProps {
  onImageChange: (image: ImageItem | null) => void;
  image?: ImageItem | null;
}

export default function SingleImageUploader({ onImageChange, image }: SingleImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    onImageChange({ uri: acceptedFiles[0] });
  }, [onImageChange]);

  const handleDelete = () => {
    onImageChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const showDropzone = !image;

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
            <p>Drop the image here ...</p>
          ) : (
            <p>Drag & drop an image here, or click to select</p>
          )}
        </div>
      )}

      {image && (
        <div className="flex items-center gap-3 border rounded-md shadow-xs overflow-hidden mt-3 pr-3">
          <div className="relative size-16">
            <Image
              src={image.uri instanceof File ? URL.createObjectURL(image.uri) : image.uri}
              alt="Selected image"
              fill
              sizes="100%"
              className="object-cover"
            />
          </div>
          <div className="flex-1 overflow-hidden py-3">
            <p className="break-all">Selected Image</p>
          </div>
          <button type="button" onClick={handleDelete}>
            <XIcon className="text-destructive" />
          </button>
        </div>
      )}
    </div>
  );
}
