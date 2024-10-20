import { PropsWithChildren } from "react";

export function Typography({ children }: PropsWithChildren) {
  return (
    <div className="tailwind-prose dark:tailwind-prose-invert">
      {children}
    </div>
  );
}
