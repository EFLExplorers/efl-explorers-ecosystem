import * as React from "react";
import styles from './Skeleton.module.css';
import { classNames } from '@/utils/classNames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={classNames(styles.skeleton, className)}
      {...props}
    />
  );
}
