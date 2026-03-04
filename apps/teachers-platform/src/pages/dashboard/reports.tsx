'use client';

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter,
  BarChart4,
  PieChart,
  LineChart as LineChartIcon,
  DownloadCloud,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
  Award,
  Clock,
  BookOpen,
  Lightbulb,
  Zap,
  Activity,
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react";
import { Student } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as PieChartRecharts,
  Pie,
  Cell,
  LineChart as LineChartRecharts,
  Line,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { classNames } from "@/utils/classNames";
import styles from './reports.module.css';

// Enhanced mock data for comprehensive analytics
const performanceData = [
  { name: "Grade A", students: 12, color: "#4ade80", trend: "+2" },
  { name: "Grade B", students: 25, color: "#60a5fa", trend: "+5" },
  { name: "Grade C", students: 18, color: "#facc15", trend: "-3" },
  { name: "Grade D", students: 8, color: "#f87171", trend: "-1" },
  { name: "Grade F", students: 2, color: "#ef4444", trend: "-2" },
];

const attendanceData = [
  { name: "90-100%", students: 35, color: "#4ade80" },
  { name: "80-90%", students: 20, color: "#60a5fa" },
  { name: "70-80%", students: 12, color: "#facc15" },
  { name: "<70%", students: 8, color: "#f87171" },
];

const progressData = [
  { month: "Jan", science: 78, math: 72, english: 65, average: 71.7 },
  { month: "Feb", science: 80, math: 75, english: 68, average: 74.3 },
  { month: "Mar", science: 82, math: 78, english: 70, average: 76.7 },
  { month: "Apr", science: 85, math: 80, english: 75, average: 80.0 },
  { month: "May", science: 87, math: 83, english: 78, average: 82.7 },
];

const engagementData = [
  { week: "W1", participation: 68, assignments: 75, attendance: 82 },
  { week: "W2", participation: 72, assignments: 78, attendance: 85 },
  { week: "W3", participation: 70, assignments: 80, attendance: 83 },
  { week: "W4", participation: 75, assignments: 82, attendance: 87 },
  { week: "W5", participation: 78, assignments: 85, attendance: 89 },
];

const subjectPerformance = [
  { subject: "Science", score: 85, trend: 4.2, students: 45 },
  { subject: "Math", score: 78, trend: 2.8, students: 45 },
  { subject: "English", score: 72, trend: 3.5, students: 45 },
  { subject: "Reading", score: 80, trend: 5.1, students: 45 },
];

const riskStudents = [
  { name: "Emma Johnson", risk: "High", reason: "Declining attendance", score: 45 },
  { name: "Michael Chen", risk: "Medium", reason: "Low assignment completion", score: 58 },
  { name: "Sarah Williams", risk: "Medium", reason: "Performance drop", score: 62 },
];

const insights = [
  { type: "success", icon: CheckCircle2, title: "Strong Improvement", description: "25 students improved by 5+ points this month" },
  { type: "warning", icon: AlertTriangle, title: "Attention Needed", description: "8 students showing declining trends" },
  { type: "info", icon: Lightbulb, title: "Opportunity", description: "Math scores have 12% improvement potential" },
  { type: "success", icon: Target, title: "On Track", description: "82% of students meeting performance goals" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeFilter, setTimeFilter] = useState("quarter");
  const [classFilter, setClassFilter] = useState("all");
  
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"]
  });
  
  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        averageAttendance: 0,
        averagePerformance: 0,
        improvementRate: 0,
        atRiskCount: 0,
        topPerformers: 0,
        engagementScore: 0,
      };
    }

    const totalStudents = students.length;
    const avgAttendance = students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / totalStudents;
    const performanceLevels = students.map(s => {
      const level = s.performanceLevel;
      if (level === 'A') return 90;
      if (level === 'B') return 80;
      if (level === 'C') return 70;
      if (level === 'D') return 60;
      if (level === 'F') return 50;
      return 70;
    });
    const avgPerformance = performanceLevels.reduce((sum, p) => sum + p, 0) / totalStudents;
    const atRisk = students.filter(s => (s.attendanceRate || 0) < 70 || s.performanceLevel === 'D' || s.performanceLevel === 'F').length;
    const topPerformers = students.filter(s => s.performanceLevel === 'A' || s.performanceLevel === 'B').length;
    
    return {
      totalStudents,
      averageAttendance: Math.round(avgAttendance),
      averagePerformance: Math.round(avgPerformance),
      improvementRate: 4.2, // Mock
      atRiskCount: atRisk,
      topPerformers,
      engagementScore: Math.round((avgAttendance + avgPerformance) / 2),
    };
  }, [students]);
  
  const getPerformanceBadge = (grade: string | undefined | null) => {
    if (!grade) return <Badge variant="outline">Not Graded</Badge>;
    
    switch (grade) {
      case 'A':
        return <Badge className={styles.badgeGreen}>Excellent</Badge>;
      case 'B':
        return <Badge className={styles.badgeBlue}>Good</Badge>;
      case 'C':
        return <Badge className={styles.badgeYellow}>Average</Badge>;
      case 'D':
      case 'F':
        return <Badge className={styles.badgeRed}>Needs Improvement</Badge>;
      default:
        return <Badge variant="outline">Not Graded</Badge>;
    }
  };
  
  const getAttendanceBadge = (rate: number | undefined | null) => {
    if (rate === undefined || rate === null) return <Badge variant="outline">No Data</Badge>;
    
    if (rate >= 90) {
      return <Badge className={styles.badgeGreen}>{rate}%</Badge>;
    } else if (rate >= 80) {
      return <Badge className={styles.badgeBlue}>{rate}%</Badge>;
    } else if (rate >= 70) {
      return <Badge className={styles.badgeYellow}>{rate}%</Badge>;
    } else {
      return <Badge className={styles.badgeRed}>{rate}%</Badge>;
    }
  };

  // Overview Tab - Comprehensive Dashboard
  const OverviewContent = () => (
    <div className={styles.contentSection}>
      {/* Key Metrics Cards */}
      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <Users className={styles.metricIcon} />
              <span className={styles.metricTrend}>+3 this month</span>
            </div>
            <div className={styles.metricValue}>{analytics.totalStudents}</div>
            <div className={styles.metricLabel}>Total Students</div>
          </CardContent>
        </Card>

        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <TrendingUp className={styles.metricIcon} />
              <span className={styles.metricTrendPositive}>+{analytics.improvementRate}%</span>
            </div>
            <div className={styles.metricValue}>{analytics.averagePerformance}%</div>
            <div className={styles.metricLabel}>Average Performance</div>
          </CardContent>
        </Card>

        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <Clock className={styles.metricIcon} />
              <span className={styles.metricTrendPositive}>+2.5%</span>
            </div>
            <div className={styles.metricValue}>{analytics.averageAttendance}%</div>
            <div className={styles.metricLabel}>Average Attendance</div>
          </CardContent>
        </Card>

        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <Activity className={styles.metricIcon} />
              <span className={styles.metricTrendPositive}>+5.2%</span>
            </div>
            <div className={styles.metricValue}>{analytics.engagementScore}%</div>
            <div className={styles.metricLabel}>Engagement Score</div>
          </CardContent>
        </Card>

        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <Award className={styles.metricIcon} />
              <span className={styles.metricTrendPositive}>+4</span>
            </div>
            <div className={styles.metricValue}>{analytics.topPerformers}</div>
            <div className={styles.metricLabel}>Top Performers</div>
          </CardContent>
        </Card>

        <Card className={styles.metricCard}>
          <CardContent className={styles.metricContent}>
            <div className={styles.metricHeader}>
              <AlertCircle className={styles.metricIcon} />
              <span className={styles.metricTrendNegative}>-2</span>
            </div>
            <div className={styles.metricValue}>{analytics.atRiskCount}</div>
            <div className={styles.metricLabel}>Students at Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Insights */}
      <Card className={styles.insightsCard}>
        <CardHeader className={styles.insightsHeader}>
          <div className={styles.insightsHeaderContent}>
            <Lightbulb className={styles.insightsIcon} />
            <h2 className={styles.insightsTitle}>Actionable Insights</h2>
          </div>
        </CardHeader>
        <CardContent className={styles.insightsContent}>
          <div className={styles.insightsGrid}>
            {insights.map((insight, index) => (
              <div key={index} className={classNames(styles.insightItem, styles[`insight${insight.type}`])}>
                <insight.icon className={styles.insightItemIcon} />
                <div className={styles.insightItemContent}>
                  <h3 className={styles.insightItemTitle}>{insight.title}</h3>
                  <p className={styles.insightItemDescription}>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Performance Distribution</h2>
              <PieChart className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChartRecharts>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartRecharts>
              </ResponsiveContainer>
            </div>
            <div className={styles.statsGrid}>
              {performanceData.map((item, index) => (
                <div key={index} className={styles.statBox}>
                  <div className={styles.statBoxHeader}>
                    <div className={styles.statBoxColor} style={{ backgroundColor: item.color }}></div>
                    <p className={styles.statLabel}>{item.name}</p>
                  </div>
                  <div className={styles.statBoxFooter}>
                    <p className={styles.statValue}>{item.students}</p>
                    <span className={styles.statTrend}>{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className={styles.progressCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Progress Over Time</h2>
              <LineChartIcon className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.progressChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                      <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </linearGradient>
                    <linearGradient id="colorEnglish" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="science" stroke="#9333ea" fillOpacity={1} fill="url(#colorScience)" name="Science" />
                  <Area type="monotone" dataKey="math" stroke="#2563eb" fillOpacity={1} fill="url(#colorMath)" name="Math" />
                  <Area type="monotone" dataKey="english" stroke="#10b981" fillOpacity={1} fill="url(#colorEnglish)" name="English" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance & Engagement */}
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Subject Performance</h2>
              <BarChart4 className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.progressChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="subject" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#9333ea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.subjectStats}>
              {subjectPerformance.map((subject, index) => (
                <div key={index} className={styles.subjectStatItem}>
                  <div className={styles.subjectStatHeader}>
                    <span className={styles.subjectStatName}>{subject.subject}</span>
                    <span className={classNames(styles.subjectStatTrend, subject.trend > 0 ? styles.trendUp : styles.trendDown)}>
                      {subject.trend > 0 ? <ArrowUpRight className={styles.trendIconSmall} /> : <ArrowDownRight className={styles.trendIconSmall} />}
                      {Math.abs(subject.trend)}%
                    </span>
                  </div>
                  <div className={styles.subjectStatBar}>
                    <div 
                      className={styles.subjectStatBarFill} 
                      style={{ width: `${subject.score}%`, backgroundColor: subject.score >= 80 ? '#4ade80' : subject.score >= 70 ? '#60a5fa' : '#facc15' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={styles.progressCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Engagement Trends</h2>
              <Activity className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.progressChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChartRecharts
                  data={engagementData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="participation" stroke="#9333ea" strokeWidth={2} name="Participation" />
                  <Line type="monotone" dataKey="assignments" stroke="#2563eb" strokeWidth={2} name="Assignments" />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} name="Attendance" />
                </LineChartRecharts>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students at Risk */}
      <Card className={styles.riskCard}>
        <CardHeader className={styles.riskHeader}>
          <div className={styles.riskHeaderContent}>
            <AlertTriangle className={styles.riskIcon} />
            <h2 className={styles.riskTitle}>Students Requiring Attention</h2>
          </div>
        </CardHeader>
        <CardContent className={styles.riskContent}>
          <div className={styles.riskList}>
            {riskStudents.map((student, index) => (
              <div key={index} className={styles.riskItem}>
                <div className={styles.riskItemHeader}>
                  <div>
                    <h3 className={styles.riskItemName}>{student.name}</h3>
                    <p className={styles.riskItemReason}>{student.reason}</p>
                  </div>
                  <Badge className={classNames(
                    styles.riskBadge,
                    student.risk === 'High' ? styles.riskBadgeHigh : styles.riskBadgeMedium
                  )}>
                    {student.risk} Risk
                  </Badge>
                </div>
                <div className={styles.riskItemFooter}>
                  <div className={styles.riskItemScore}>
                    <span className={styles.riskItemScoreLabel}>Current Score:</span>
                    <span className={styles.riskItemScoreValue}>{student.score}%</span>
                  </div>
                  <Button variant="outline" size="sm" className={styles.riskActionButton}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Performance Content
  const PerformanceContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Performance Overview</h2>
              <PieChart className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChartRecharts>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartRecharts>
              </ResponsiveContainer>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <p className={styles.statLabel}>Average Grade</p>
                <p className={styles.statValue}>B</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statLabel}>Top Subject</p>
                <p className={styles.statValue}>Science</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={styles.progressCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Progress Over Time</h2>
              <LineChartIcon className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.progressChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChartRecharts
                  data={progressData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="science" stroke="#6d28d9" strokeWidth={2} />
                  <Line type="monotone" dataKey="math" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="english" stroke="#10b981" strokeWidth={2} />
                </LineChartRecharts>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <div className={styles.tableHeaderContent}>
            <h2 className={styles.tableTitle}>Student Performance Details</h2>
            <div className={styles.tableActions}>
              <Button variant="outline" size="sm" className={styles.actionButton}>
                <Filter className={styles.actionIcon} />
                Filter
              </Button>
              <Button variant="outline" size="sm" className={styles.actionButton}>
                <DownloadCloud className={styles.actionIcon} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Science</TableHead>
                  <TableHead>Mathematics</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>Overall Grade</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className={styles.emptyCell}>
                      Loading student data...
                    </TableCell>
                  </TableRow>
                ) : students?.filter(s => classFilter === 'all' || s.level === classFilter).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className={styles.emptyCell}>
                      No student data available
                    </TableCell>
                  </TableRow>
                ) : (
                  students?.filter(s => classFilter === 'all' || s.level === classFilter).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className={styles.nameCell}>{student.fullName}</TableCell>
                      <TableCell>Level {student.level}</TableCell>
                      <TableCell>
                        {student.id % 5 === 0 ? 'C+' : student.id % 3 === 0 ? 'B+' : student.id % 2 === 0 ? 'A-' : 'B'}
                      </TableCell>
                      <TableCell>
                        {student.id % 4 === 0 ? 'B-' : student.id % 3 === 0 ? 'A' : student.id % 2 === 0 ? 'B+' : 'C+'}
                      </TableCell>
                      <TableCell>
                        {student.id % 5 === 0 ? 'B' : student.id % 3 === 0 ? 'B+' : student.id % 2 === 0 ? 'C+' : 'A-'}
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(student.performanceLevel)}
                      </TableCell>
                      <TableCell>
                        {student.id % 3 === 0 ? (
                          <div className={classNames(styles.trend, styles.trendUp)}>
                            <ArrowUpRight className={styles.trendIcon} />
                            <span>+4.2%</span>
                          </div>
                        ) : student.id % 5 === 0 ? (
                          <div className={classNames(styles.trend, styles.trendDown)}>
                            <ArrowDownRight className={styles.trendIcon} />
                            <span>-2.8%</span>
                          </div>
                        ) : (
                          <div className={classNames(styles.trend, styles.trendNeutral)}>
                            <ArrowUpRight className={styles.trendIcon} />
                            <span>+1.5%</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Attendance Content
  const AttendanceContent = () => (
    <div className={styles.contentSection}>
      <div className={styles.chartsGrid}>
        <Card className={styles.chartCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Attendance Overview</h2>
              <PieChart className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChartRecharts>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChartRecharts>
              </ResponsiveContainer>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <p className={styles.statLabel}>Average Attendance</p>
                <p className={styles.statValue}>86%</p>
              </div>
              <div className={styles.statBox}>
                <p className={styles.statLabel}>Absence Rate</p>
                <p className={styles.statValue}>14%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={styles.progressCard}>
          <CardHeader className={styles.chartHeader}>
            <div className={styles.chartHeaderContent}>
              <h2 className={styles.chartTitle}>Monthly Attendance</h2>
              <BarChart4 className={styles.chartIcon} />
            </div>
          </CardHeader>
          <CardContent className={styles.chartContent}>
            <div className={styles.progressChartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { month: "Jan", present: 92, absent: 8 },
                    { month: "Feb", present: 88, absent: 12 },
                    { month: "Mar", present: 85, absent: 15 },
                    { month: "Apr", present: 90, absent: 10 },
                    { month: "May", present: 83, absent: 17 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#4ade80" name="Present" />
                  <Bar dataKey="absent" stackId="a" fill="#f87171" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <div className={styles.tableHeaderContent}>
            <h2 className={styles.tableTitle}>Student Attendance Details</h2>
            <div className={styles.tableActions}>
              <Button variant="outline" size="sm" className={styles.actionButton}>
                <Filter className={styles.actionIcon} />
                Filter
              </Button>
              <Button variant="outline" size="sm" className={styles.actionButton}>
                <DownloadCloud className={styles.actionIcon} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                  <TableHead>Days Present</TableHead>
                  <TableHead>Days Absent</TableHead>
                  <TableHead>Last Absence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className={styles.emptyCell}>
                      Loading attendance data...
                    </TableCell>
                  </TableRow>
                ) : students?.filter(s => classFilter === 'all' || s.level === classFilter).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={styles.emptyCell}>
                      No attendance data available
                    </TableCell>
                  </TableRow>
                ) : (
                  students?.filter(s => classFilter === 'all' || s.level === classFilter).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className={styles.nameCell}>{student.fullName}</TableCell>
                      <TableCell>Level {student.level}</TableCell>
                      <TableCell>
                        {getAttendanceBadge(student.attendanceRate)}
                      </TableCell>
                      <TableCell>
                        {Math.round((student.attendanceRate || 80) / 100 * 90)}
                      </TableCell>
                      <TableCell>
                        {90 - Math.round((student.attendanceRate || 80) / 100 * 90)}
                      </TableCell>
                      <TableCell>
                        {student.id % 5 === 0 ? 'May 15, 2023' : 
                         student.id % 3 === 0 ? 'May 10, 2023' : 
                         student.id % 2 === 0 ? 'May 3, 2023' : 'Apr 28, 2023'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Assessments Content
  const AssessmentsContent = () => (
    <div className={styles.contentSection}>
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Assessments</h2>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className={styles.emptyCell}>
                      Loading assessments...
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className={styles.emptyCell}>
                      No assessments available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Analytics & Reports</h1>
          <p className={styles.subtitle}>Comprehensive insights into student performance and engagement</p>
        </div>
        <div className={styles.headerActions}>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className={styles.filterSelect}>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className={styles.downloadButton}>
            <Download className={styles.downloadIcon} />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewContent />
        </TabsContent>
        
        <TabsContent value="performance">
          <PerformanceContent />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceContent />
        </TabsContent>
        
        <TabsContent value="assessments">
          <AssessmentsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
