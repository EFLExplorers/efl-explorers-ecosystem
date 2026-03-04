import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import styles from './Label.module.css';
import { classNames } from '@/utils/classNames';

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={classNames(styles.label, className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
