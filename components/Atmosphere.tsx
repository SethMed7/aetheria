type AtmosphereProps = {
  /** Landing dark sections use the cyan-forward landing palette. */
  variant?: "studio" | "landing";
};

export function Atmosphere({ variant = "studio" }: AtmosphereProps) {
  return (
    <div
      className={`atmosphere ${variant === "landing" ? "atmosphere-landing" : ""}`}
      aria-hidden="true"
    />
  );
}
