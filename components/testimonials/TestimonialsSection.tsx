"use client";
import { StarRating } from "./StarRating";
import { useAutoRotate } from "@/hooks/useAutoRotate";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Testimonial } from "@/lib/content/types";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  title: string;
}

const ROTATION_MS = 7000;

export function TestimonialsSection({ testimonials, title }: TestimonialsSectionProps) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { index, goTo, next, previous } = useAutoRotate(
    testimonials.length,
    ROTATION_MS,
    !prefersReducedMotion
  );

  if (testimonials.length === 0) return null;
  const current = testimonials[index];

  return (
    <section id="depoimentos" className="mx-auto max-w-4xl px-6 py-20 md:py-24">
      <h2 className="text-center font-display text-3xl text-ivory md:text-4xl">{title}</h2>

      <div
        className="mt-10 rounded-2xl border border-ivory/10 bg-ink/60 p-6 md:p-10"
        aria-live="polite"
      >
        <StarRating rating={current.rating} className="justify-center" />

        <blockquote className="mt-6 text-center font-display text-xl leading-relaxed text-ivory md:text-2xl">
          “{current.quote}”
        </blockquote>

        <figcaption className="mt-6 text-center font-body text-sm text-sand/75">
          <span className="font-semibold text-brassLight">{current.name}</span>
          <span aria-hidden="true"> · </span>
          {current.role}
        </figcaption>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={previous}
          aria-label="Depoimento anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-brass/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          {testimonials.map((testimonial, position) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => goTo(position)}
              aria-label={`Ver depoimento de ${testimonial.name}`}
              aria-current={position === index}
              className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass ${
                position === index ? "w-6 bg-brass" : "w-2 bg-ivory/25 hover:bg-ivory/50"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Próximo depoimento"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-brass/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        >
          ›
        </button>
      </div>
    </section>
  );
}
