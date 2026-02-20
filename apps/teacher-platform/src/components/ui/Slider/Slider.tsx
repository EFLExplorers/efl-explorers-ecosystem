import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import styles from './Slider.module.css';
import { classNames } from '@/utils/classNames';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={classNames(styles.slider, className)}
    {...props}
  >
    <SliderPrimitive.Track className={styles.track}>
      <SliderPrimitive.Range className={styles.range} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={styles.thumb} />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
