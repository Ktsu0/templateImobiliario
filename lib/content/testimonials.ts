import testimonialsData from "@/content/clients/meridiano/testimonials.json";
import type { Testimonial } from "./types";

export function getTestimonials(): Testimonial[] {
  return testimonialsData as Testimonial[];
}
