import testimonialsData from "@/content/clients/pioneira/testimonials.json";
import type { Testimonial } from "./types";

export function getTestimonials(): Testimonial[] {
  return testimonialsData as Testimonial[];
}
