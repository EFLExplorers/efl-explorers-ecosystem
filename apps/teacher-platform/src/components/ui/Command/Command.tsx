import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import styles from './Command.module.css';
import { classNames } from '@/utils/classNames';

export interface CommandProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {}

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={classNames(styles.command, className)}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

export interface CommandDialogProps extends DialogProps {}

export function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className={styles.dialogContent}>
        <Command className={styles.commandInDialog}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export interface CommandInputProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className={styles.inputWrapper} cmdk-input-wrapper="">
    <Search className={styles.searchIcon} />
    <CommandPrimitive.Input
      ref={ref}
      className={classNames(styles.input, className)}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

export interface CommandListProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> {}

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={classNames(styles.list, className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

export interface CommandEmptyProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> {}

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={styles.empty}
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

export interface CommandGroupProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> {}

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={classNames(styles.group, className)}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

export interface CommandSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> {}

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={classNames(styles.separator, className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

export interface CommandItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {}

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={classNames(styles.item, className)}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      className={classNames(styles.shortcut, className)}
      {...props}
    />
  );
}
CommandShortcut.displayName = "CommandShortcut";
