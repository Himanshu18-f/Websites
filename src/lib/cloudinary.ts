export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";

interface CloudinaryTransforms {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb";
  quality?: number | "auto";
  format?: "auto" | "webp" | "jpg" | "png";
  effect?: string;
}

export function getCloudinaryUrl(
  publicId: string,
  transforms?: CloudinaryTransforms,
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    return publicId;
  }

  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  if (!transforms) {
    return `${base}/${publicId}`;
  }

  const parts: string[] = [];

  if (transforms.width || transforms.height) {
    const w = transforms.width || transforms.height;
    const h = transforms.height || transforms.width;
    const c = transforms.crop || "fill";
    parts.push(`c_${c},w_${w},h_${h}`);
  }

  if (transforms.quality) {
    parts.push(`q_${transforms.quality}`);
  }

  if (transforms.format) {
    parts.push(`f_${transforms.format === "auto" ? "auto" : transforms.format}`);
  }

  if (transforms.effect) {
    parts.push(`e_${transforms.effect}`);
  }

  const transformation = parts.join(",");
  return `${base}/${transformation}/${publicId}`;
}
