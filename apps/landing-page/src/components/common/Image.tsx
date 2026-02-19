import NextImage from "next/image";
import { ImageProps } from "next/image";
import { useState } from "react";
import styles from "@/styles/base/images.module.css";

export const Image = ({ src, alt, className, ...props }: ImageProps) => {
  const [isError, setIsError] = useState(false);

  // Fallback to text if image fails to load
  if (isError) {
    console.error(`Failed to load image: ${src}`);
    return <span className={className}>EFL Explorers</span>;
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      className={className}
      width={props.width || 0}
      height={props.height || 0}
      onError={() => setIsError(true)}
      onLoad={() => {}}
      {...props}
    />
  );
};
