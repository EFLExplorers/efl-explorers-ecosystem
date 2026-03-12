import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/Button";
import styles from './Pagination.module.css';
import { classNames } from '@/utils/classNames';

export interface PaginationProps extends React.ComponentProps<"nav"> {}

export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={classNames(styles.pagination, className)}
      {...props}
    />
  );
}
Pagination.displayName = "Pagination";

export interface PaginationContentProps extends React.ComponentProps<"ul"> {}

export const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={classNames(styles.content, className)}
      {...props}
    />
  )
);
PaginationContent.displayName = "PaginationContent";

export interface PaginationItemProps extends React.ComponentProps<"li"> {}

export const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={classNames(styles.item, className)} {...props} />
  )
);
PaginationItem.displayName = "PaginationItem";

export interface PaginationLinkProps extends React.ComponentProps<"a"> {
  isActive?: boolean;
  size?: ButtonProps['size'];
}

export function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={classNames(
        styles.link,
        isActive ? styles.active : styles.inactive,
        className
      )}
      {...props}
    />
  );
}
PaginationLink.displayName = "PaginationLink";

export interface PaginationPreviousProps extends React.ComponentProps<typeof PaginationLink> {}

export function PaginationPrevious({ className, ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={classNames(styles.previous, className)}
      {...props}
    >
      <ChevronLeft className={styles.icon} />
      <span>Previous</span>
    </PaginationLink>
  );
}
PaginationPrevious.displayName = "PaginationPrevious";

export interface PaginationNextProps extends React.ComponentProps<typeof PaginationLink> {}

export function PaginationNext({ className, ...props }: PaginationNextProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={classNames(styles.next, className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className={styles.icon} />
    </PaginationLink>
  );
}
PaginationNext.displayName = "PaginationNext";

export interface PaginationEllipsisProps extends React.ComponentProps<"span"> {}

export function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      className={classNames(styles.ellipsis, className)}
      {...props}
    >
      <MoreHorizontal className={styles.ellipsisIcon} />
      <span className={styles.srOnly}>More pages</span>
    </span>
  );
}
PaginationEllipsis.displayName = "PaginationEllipsis";
