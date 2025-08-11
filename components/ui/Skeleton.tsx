// components/ui/Skeleton.tsx  (albo src/components/ui/Skeleton.tsx)
import React from "react";

type Props = {
  className?: string;
  as?: keyof JSX.IntrinsicElements; // opcjonalnie: <Skeleton as="span" />
};

export default function Skeleton({ className = "", as: Tag = "div" }: Props) {
  return (
    <Tag
      className={`animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/70 ${className}`}
      aria-busy="true"
      aria-live="polite"
    />
  );
}
