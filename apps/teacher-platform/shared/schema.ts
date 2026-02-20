import { z } from "zod";
import type {
  User,
  Student,
  Lesson,
  Curriculum,
  Event,
  Message,
  Announcement,
  Task,
  Material,
  Bookmark,
  LessonMaterial,
} from "@repo/database";

// 1. Export Prisma Types Directly
export type {
  User,
  Student,
  Lesson,
  Curriculum,
  Event,
  Message,
  Announcement,
  Task,
  Material,
  Bookmark,
  LessonMaterial,
};

// 2. Pure Zod Validation Schemas (No Drizzle needed)
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string().default("teacher").optional(),
  avatarUrl: z.string().optional().nullable(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertStudentSchema = z.object({
  fullName: z.string(),
  email: z.string().email().optional().nullable(),
  level: z.string(),
  unitId: z.string(),
  nativeLanguage: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianContact: z.string().optional().nullable(),
  attendanceRate: z.number().optional().nullable(),
  performanceLevel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export const insertLessonSchema = z.object({
  title: z.string(),
  subject: z.string(),
  description: z.string().optional().nullable(),
  classId: z.string(),
  date: z.union([z.string(), z.date()]),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional().nullable(),
  status: z.string().default("upcoming").optional(),
});
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export const insertCurriculumSchema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.string(),
  description: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  units: z.any().optional().nullable(), // Maps to Prisma Json
});
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;

export const insertEventSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  date: z.union([z.string(), z.date()]),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional().nullable(),
  type: z.string().default("class").optional(),
});
export type InsertEvent = z.infer<typeof insertEventSchema>;

export const insertMessageSchema = z.object({
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
  isRead: z.boolean().default(false).optional(),
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertAnnouncementSchema = z.object({
  title: z.string(),
  content: z.string(),
  priority: z.string().default("normal").optional(),
  createdBy: z.number(),
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export const insertTaskSchema = z.object({
  title: z.string(),
  completed: z.boolean().default(false).optional(),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
  userId: z.number(),
});
export type InsertTask = z.infer<typeof insertTaskSchema>;

export const insertMaterialSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  category: z.string(),
  url: z.string(),
  createdBy: z.number(),
});
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export const insertBookmarkSchema = z.object({
  title: z.string(),
  url: z.string(),
  category: z.string().optional().nullable(),
  userId: z.number(),
});
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export const insertLessonMaterialSchema = z.object({
  lessonId: z.number(),
  materialId: z.number(),
});
export type InsertLessonMaterial = z.infer<typeof insertLessonMaterialSchema>;
