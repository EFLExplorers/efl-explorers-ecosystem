import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import styles from './Progress.module.css';
import { classNames } from '@/utils/classNames';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={classNames(styles.progress, className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={styles.indicator}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;
