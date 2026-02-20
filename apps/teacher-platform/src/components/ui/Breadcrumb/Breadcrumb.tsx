import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import styles from './Breadcrumb.module.css';
import { classNames } from '@/utils/classNames';

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />
);
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<"ol"> {}

export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={classNames(styles.list, className)}
      {...props}
    />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {}

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={classNames(styles.item, className)}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
}

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref}
        className={classNames(styles.link, className)}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export interface BreadcrumbPageProps extends React.ComponentPropsWithoutRef<"span"> {}

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={classNames(styles.page, className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export interface BreadcrumbSeparatorProps extends React.ComponentProps<"li"> {
  children?: React.ReactNode;
}

export function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={classNames(styles.separator, className)}
      {...props}
    >
      {children ?? <ChevronRight className={styles.separatorIcon} />}
    </li>
  );
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export interface BreadcrumbEllipsisProps extends React.ComponentProps<"span"> {}

export function BreadcrumbEllipsis({ className, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={classNames(styles.ellipsis, className)}
      {...props}
    >
      <MoreHorizontal className={styles.ellipsisIcon} />
      <span className={styles.srOnly}>More</span>
    </span>
  );
}
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";
