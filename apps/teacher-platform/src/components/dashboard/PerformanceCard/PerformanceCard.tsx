import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Student } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './PerformanceCard.module.css';

type TimeRange = "30days" | "3months" | "6months";

function bucketPerformanceLevel(raw: string | null | undefined): string {
  const s = raw?.trim();
  return s && s.length > 0 ? s : "Unspecified";
}

export function PerformanceCard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");

  const { data: students, isLoading, isError } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const chartData = useMemo(() => {
    if (!students?.length) {
      return [];
    }
    const counts = new Map<string, number>();
    for (const s of students) {
      const key = bucketPerformanceLevel(s.performanceLevel);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, students: count }))
      .sort((a, b) => b.students - a.students);
  }, [students]);

  const avgAttendance = useMemo(() => {
    if (!students?.length) {
      return null;
    }
    const withRate = students.filter(
      (s) => typeof s.attendanceRate === "number" && Number.isFinite(s.attendanceRate)
    );
    if (withRate.length === 0) {
      return null;
    }
    const sum = withRate.reduce((acc, s) => acc + (s.attendanceRate as number), 0);
    return Math.round((sum / withRate.length) * 10) / 10;
  }, [students]);

  const rosterSize = students?.length ?? 0;

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <h2 className={styles.title}>Class performance</h2>
        <Select
          defaultValue={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className={styles.content}>
        <p className={styles.rangeHint}>
          Historical trends by week are not stored yet; this chart reflects current roster labels from your students API.
          {timeRange !== "30days" ? " (Time range filter reserved for future reporting.)" : ""}
        </p>

        {isLoading ? (
          <div className={styles.emptyState}>Loading roster…</div>
        ) : isError ? (
          <div className={styles.emptyState}>Could not load students for this chart.</div>
        ) : rosterSize === 0 ? (
          <div className={styles.emptyState}>
            Add students to see performance level distribution.
          </div>
        ) : (
          <>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} interval={0} angle={-18} textAnchor="end" height={56} />
                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      color: "#111827",
                    }}
                  />
                  <Bar dataKey="students" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <p className={styles.statLabel}>Roster size</p>
                <p className={styles.statValue}>{rosterSize}</p>
              </div>
              <div className={styles.statItem}>
                <p className={styles.statLabel}>Avg. attendance</p>
                <p className={styles.statValue}>
                  {avgAttendance !== null ? `${avgAttendance}%` : "—"}
                </p>
              </div>
              <div className={styles.statItem}>
                <p className={styles.statLabel}>Performance labels</p>
                <p className={classNames(styles.statValue, styles.statValueGreen)}>
                  {chartData.length} groups
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
