import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { ToggleProps } from "@/components/ui/Toggle";
import styles from './ToggleGroup.module.css';
import { classNames } from '@/utils/classNames';

const ToggleGroupContext = React.createContext<Pick<ToggleProps, 'size' | 'variant'>>({
  size: "default",
  variant: "default",
});

export type ToggleGroupProps = Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, 'variant' | 'size'> & Pick<ToggleProps, 'variant' | 'size'>

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={classNames(styles.toggleGroup, className)}
    {...(props as any)}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export type ToggleGroupItemProps = Omit<React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, 'variant' | 'size'> & Pick<ToggleProps, 'variant' | 'size'>

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={classNames(
        styles.item,
        styles[context.variant || variant || 'default'],
        styles[context.size || size || 'default'],
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
