import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/Button";
import styles from './Calendar.module.css';
import { classNames } from '@/utils/classNames';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames: calendarClassNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={classNames(styles.calendar, className)}
      classNames={{
        months: styles.months,
        month: styles.month,
        caption: styles.caption,
        caption_label: styles.captionLabel,
        nav: styles.nav,
        nav_button: styles.navButton,
        nav_button_previous: styles.navButtonPrevious,
        nav_button_next: styles.navButtonNext,
        table: styles.table,
        head_row: styles.headRow,
        head_cell: styles.headCell,
        row: styles.row,
        cell: styles.cell,
        day: styles.day,
        day_range_end: styles.dayRangeEnd,
        day_selected: styles.daySelected,
        day_today: styles.dayToday,
        day_outside: styles.dayOutside,
        day_disabled: styles.dayDisabled,
        day_range_middle: styles.dayRangeMiddle,
        day_hidden: styles.dayHidden,
        ...calendarClassNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className={styles.icon} />,
        IconRight: ({ ...props }) => <ChevronRight className={styles.icon} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
