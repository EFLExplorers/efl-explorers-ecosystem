'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  Plus, 
  Download, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { Student } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './students.module.css';

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  
  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"]
  });
  
  // Filter students based on search
  const filteredStudents = students?.filter(student => 
    student.fullName.toLowerCase().includes(search.toLowerCase()) ||
    student.email?.toLowerCase().includes(search.toLowerCase()) ||
    student.guardianName?.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  // Paginate students
  const totalPages = Math.ceil((filteredStudents?.length || 0) / PAGE_SIZE);
  const paginatedStudents = filteredStudents?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  
  const getPerformanceBadge = (grade: string | null | undefined) => {
    if (!grade) return null;
    
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
  
  const getAttendanceBadge = (rate: number | null | undefined) => {
    if (rate === undefined || rate === null) return null;
    
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
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>Manage your class students and their information</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" className={styles.exportButton}>
            <Download className={styles.actionIcon} />
            Export
          </Button>
          <Button className={styles.addButton}>
            <Plus className={styles.actionIcon} />
            Add Student
          </Button>
        </div>
      </div>
      
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.searchBar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Search students..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className={styles.filterButton}>
              <SlidersHorizontal className={styles.filterIcon} />
              Filters
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className={styles.cardContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade/Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className={styles.emptyCell}>
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className={styles.emptyCell}>
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className={styles.nameCell}>
                        <div>{student.fullName}</div>
                        <div className={styles.email}>{student.email}</div>
                      </TableCell>
                      <TableCell>
                        Level {student.level}, Unit {student.unitId}
                      </TableCell>
                      <TableCell>
                        <div>{student.guardianName}</div>
                        <div className={styles.guardianContact}>{student.guardianContact}</div>
                      </TableCell>
                      <TableCell>
                        {getAttendanceBadge(student.attendanceRate)}
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(student.performanceLevel)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              <div className={styles.paginationButtons}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className={styles.paginationIcon} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className={styles.paginationIcon} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
