interface FramePreloaderProps {
  progress: number;
}

export function FramePreloader({ progress }: FramePreloaderProps) {
  if (progress >= 1) return null;
  const percent = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Carregando sequência do hero"
      className="absolute bottom-6 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-black/20"
    >
      <div
        className="h-full bg-brassLight transition-[width] duration-150"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
