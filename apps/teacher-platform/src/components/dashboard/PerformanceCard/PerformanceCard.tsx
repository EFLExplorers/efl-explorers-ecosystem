import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { classNames } from "@/utils/classNames";
import styles from './PerformanceCard.module.css';

// Performance data (would come from API in a real app)
const performanceData = [
  { name: "Week 1", average: 70, top: 90, improvement: 0 },
  { name: "Week 2", average: 72, top: 92, improvement: 2 },
  { name: "Week 3", average: 75, top: 93, improvement: 3 },
  { name: "Week 4", average: 78, top: 94, improvement: 3 },
];

type TimeRange = "30days" | "3months" | "6months";

export function PerformanceCard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  
  // This would fetch different data based on the time range in a real app
  const data = performanceData;
  
  // Calculate current stats
  const currentAverage = data[data.length - 1].average;
  const topPerformer = data[data.length - 1].top;
  const totalImprovement = data.reduce((sum, item) => sum + item.improvement, 0);

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <h2 className={styles.title}>Class Performance</h2>
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
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  color: '#111827'
                }} 
              />
              <Legend 
                wrapperStyle={{ color: '#111827' }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="var(--primary)" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="top" 
                stroke="var(--secondary)" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <p className={styles.statLabel}>Average Score</p>
            <p className={styles.statValue}>{currentAverage}%</p>
          </div>
          <div className={styles.statItem}>
            <p className={styles.statLabel}>Top Performer</p>
            <p className={styles.statValue}>{topPerformer}%</p>
          </div>
          <div className={styles.statItem}>
            <p className={styles.statLabel}>Improvement</p>
            <p className={classNames(styles.statValue, styles.statValueGreen)}>+{totalImprovement}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
