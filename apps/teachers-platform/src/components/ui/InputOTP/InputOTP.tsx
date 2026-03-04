import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import styles from './InputOTP.module.css';
import { classNames } from '@/utils/classNames';

export type InputOTPProps = Omit<React.ComponentPropsWithoutRef<typeof OTPInput>, 'containerClassName'> & {
  containerClassName?: string;
};

export const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={classNames(styles.container, containerClassName)}
    className={classNames(styles.input, className)}
    {...(props as any)}
  />
));
InputOTP.displayName = "InputOTP";

export interface InputOTPGroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames(styles.group, className)} {...props} />
  )
);
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
}

export const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
      <div
        ref={ref}
        className={classNames(
          styles.slot,
          isActive && styles.active,
          className
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className={styles.caret}>
            <div className={styles.caretLine} />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

export interface InputOTPSeparatorProps extends React.ComponentPropsWithoutRef<"div"> {}

export const InputOTPSeparator = React.forwardRef<HTMLDivElement, InputOTPSeparatorProps>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot className={styles.separatorIcon} />
    </div>
  )
);
InputOTPSeparator.displayName = "InputOTPSeparator";
