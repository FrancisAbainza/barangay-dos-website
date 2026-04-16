import z from "zod";
import type { ImageItem } from "@/components/single-image-uploader";
import type { OfficialType } from "@/types/about-us";

export const editHeaderSchema = z.object({
  name: z.string().min(2, "Barangay name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters"),
  barangayLogo: z.custom<ImageItem>().nullable().optional(),
  skLogo: z.custom<ImageItem>().nullable().optional(),
});

export type EditHeaderFormValues = z.infer<typeof editHeaderSchema>;

export const officialSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  picture: z.custom<ImageItem>().nullable().optional(),
});

export type OfficialFormValues = z.infer<typeof officialSchema>;
