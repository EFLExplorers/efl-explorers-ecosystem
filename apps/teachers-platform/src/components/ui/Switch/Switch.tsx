import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import styles from './Switch.module.css';
import { classNames } from '@/utils/classNames';

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={classNames(styles.switch, className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={styles.thumb} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
