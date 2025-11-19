'use client';

import * as React from 'react';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { cn } from './utils';

interface ImageCropContextValue {
  croppedImage: string | null;
  setCroppedImage: (image: string | null) => void;
  crop: Crop | undefined;
  setCrop: (crop: Crop | undefined) => void;
  completedCrop: PixelCrop | undefined;
  setCompletedCrop: (crop: PixelCrop | undefined) => void;
  imgRef: React.RefObject<HTMLImageElement>;
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  handleComplete: (crop: PixelCrop) => void;
  applyChanges: () => void;
  resetCrop: () => void;
  aspect: number;
  circularCrop: boolean;
}

const ImageCropContext = React.createContext<ImageCropContextValue | undefined>(
  undefined
);

function useImageCrop() {
  const context = React.useContext(ImageCropContext);
  if (!context) {
    throw new Error('useImageCrop must be used within ImageCrop');
  }
  return context;
}

interface ImageCropProps {
  file: File;
  aspect?: number;
  circularCrop?: boolean;
  maxImageSize?: number;
  children: React.ReactNode;
  onCrop?: (croppedImage: string) => void;
  onChange?: (crop: Crop) => void;
  onComplete?: (crop: PixelCrop) => void;
}

export function ImageCrop({
  file,
  aspect = 1,
  circularCrop = false,
  maxImageSize = 1024 * 1024,
  children,
  onCrop,
  onChange,
  onComplete,
}: ImageCropProps) {
  const [crop, setCrop] = React.useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = React.useState<
    PixelCrop | undefined
  >();
  const [croppedImage, setCroppedImage] = React.useState<string | null>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleImageLoad = React.useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      );

      setCrop(newCrop);
    },
    [aspect]
  );

  const handleComplete = React.useCallback(
    (crop: PixelCrop) => {
      setCompletedCrop(crop);
      onComplete?.(crop);
    },
    [onComplete]
  );

  const applyChanges = React.useCallback(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    if (circularCrop) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        cropWidth / 2,
        cropHeight / 2,
        Math.min(cropWidth, cropHeight) / 2,
        0,
        2 * Math.PI
      );
      ctx.clip();
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    if (circularCrop) {
      ctx.restore();
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        
        if (blob.size > maxImageSize) {
          alert(`Image is too large. Please keep it under ${maxImageSize / (1024 * 1024)}MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCroppedImage(result);
          onCrop?.(result);
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.95
    );
  }, [completedCrop, circularCrop, maxImageSize, onCrop]);

  const resetCrop = React.useCallback(() => {
    if (imgRef.current) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
      setCompletedCrop(undefined);
    }
  }, [aspect]);

  const handleCropChange = React.useCallback(
    (crop: Crop, percentCrop: Crop) => {
      setCrop(percentCrop);
      onChange?.(percentCrop);
    },
    [onChange]
  );

  const imageSrc = React.useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  React.useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  return (
    <ImageCropContext.Provider
      value={{
        croppedImage,
        setCroppedImage,
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        imgRef,
        previewCanvasRef,
        handleImageLoad,
        handleComplete,
        applyChanges,
        resetCrop,
        aspect,
        circularCrop,
      }}
    >
      <div className="space-y-4">
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleComplete}
          aspect={aspect}
          circularCrop={circularCrop}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            onLoad={handleImageLoad}
            style={{ maxWidth: '100%' }}
          />
        </ReactCrop>
        <canvas
          ref={previewCanvasRef}
          style={{
            display: 'none',
          }}
        />
        {children}
      </div>
    </ImageCropContext.Provider>
  );
}

export function ImageCropContent({ className }: { className?: string }) {
  return <div className={cn('w-full', className)} />;
}

export function ImageCropApply() {
  const { applyChanges } = useImageCrop();
  return (
    <Button 
      type="button" 
      onClick={applyChanges}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      Apply
    </Button>
  );
}

export function ImageCropReset() {
  const { resetCrop } = useImageCrop();
  return (
    <Button type="button" variant="outline" onClick={resetCrop}>
      Reset
    </Button>
  );
}

