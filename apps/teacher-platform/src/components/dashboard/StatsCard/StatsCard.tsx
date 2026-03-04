import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowUp, ArrowDown } from "lucide-react";
import styles from './StatsCard.module.css';
import { classNames } from '@/utils/classNames';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  iconClassName?: string;
}

export function StatsCard({ title, value, icon, change, iconClassName }: StatsCardProps) {
  return (
    <Card className={styles.card}>
      <CardContent className={styles.content}>
        <div className={styles.container}>
          <div className={styles.info}>
            <p className={styles.title}>{title}</p>
            <h3 className={styles.value}>{value}</h3>
            
            {change && (
              <p className={classNames(
                styles.change,
                change.type === "increase" && styles.increase,
                change.type === "decrease" && styles.decrease,
                change.type === "neutral" && styles.neutral
              )}>
                {change.type === "increase" && <ArrowUp className={styles.icon} />}
                {change.type === "decrease" && <ArrowDown className={styles.icon} />}
                <span>{change.value}</span>
              </p>
            )}
          </div>
          
          <div className={classNames(styles.iconContainer, iconClassName)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
