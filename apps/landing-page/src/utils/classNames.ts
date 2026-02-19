type ClassName = string | undefined | null | boolean | Record<string, boolean>;

export function classNames(...classes: ClassName[]): string {
  return classes
    .flat()
    .filter(
      (cls): cls is string | Record<string, boolean> =>
        cls !== null && cls !== undefined && cls !== false
    )
    .map((cls) => {
      if (typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return cls;
    })
    .flat()
    .join(" ");
}
