import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { classNames } from "@/utils/classNames";
import styles from './Menubar.module.css';

export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarPortal = MenubarPrimitive.Portal;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

export interface MenubarProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> {}

export const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  MenubarProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={classNames(styles.menubar, className)}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

export interface MenubarTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> {}

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={classNames(styles.trigger, className)}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

export interface MenubarSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> {
  inset?: boolean;
}

export const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  MenubarSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={classNames(styles.subTrigger, inset && styles.inset, className)}
    {...props}
  >
    {children}
    <ChevronRight className={styles.chevron} />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

export interface MenubarSubContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> {}

export const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  MenubarSubContentProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={classNames(styles.subContent, className)}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

export interface MenubarContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  sideOffset?: number;
}

export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={classNames(styles.content, className)}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

export interface MenubarItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  inset?: boolean;
}

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={classNames(styles.item, inset && styles.inset, className)}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

export interface MenubarCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> {}

export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={classNames(styles.checkboxItem, className)}
    checked={checked}
    {...props}
  >
    <span className={styles.indicator}>
      <MenubarPrimitive.ItemIndicator>
        <Check className={styles.checkIcon} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

export interface MenubarRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> {}

export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={classNames(styles.radioItem, className)}
    {...props}
  >
    <span className={styles.indicator}>
      <MenubarPrimitive.ItemIndicator>
        <Circle className={styles.circleIcon} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

export interface MenubarLabelProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> {
  inset?: boolean;
}

export const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  MenubarLabelProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={classNames(styles.label, inset && styles.inset, className)}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

export interface MenubarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator> {}

export const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  MenubarSeparatorProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={classNames(styles.separator, className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

export interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      className={classNames(styles.shortcut, className)}
      {...props}
    />
  );
}
MenubarShortcut.displayName = "MenubarShortcut";
