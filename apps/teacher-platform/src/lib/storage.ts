// Import types from shared schema for interface compatibility
import type {
  User, InsertUser,
  Student, InsertStudent,
  Lesson, InsertLesson,
  Curriculum, InsertCurriculum,
  Event, InsertEvent,
  Message, InsertMessage,
  Announcement, InsertAnnouncement,
  Task, InsertTask,
  Material, InsertMaterial,
  Bookmark, InsertBookmark,
  LessonMaterial, InsertLessonMaterial
} from "@shared/schema";

// Import Prisma client
import { getPrisma } from "./db";
import type { Prisma } from "@repo/database";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Lessons
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: number): Promise<boolean>;
  
  // Curriculum
  getCurriculumItems(): Promise<Curriculum[]>;
  getCurriculumItem(id: number): Promise<Curriculum | undefined>;
  createCurriculumItem(curriculum: InsertCurriculum): Promise<Curriculum>;
  updateCurriculumItem(id: number, curriculum: Partial<InsertCurriculum>): Promise<Curriculum | undefined>;
  deleteCurriculumItem(id: number): Promise<boolean>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Messages
  getMessages(userId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  
  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Materials
  getMaterials(): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  
  // Bookmarks
  getBookmarks(userId: number): Promise<Bookmark[]>;
  getBookmark(id: number): Promise<Bookmark | undefined>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // Lesson Materials
  getLessonMaterials(lessonId: number): Promise<Material[]>;
  getLessonMaterial(id: number): Promise<LessonMaterial | undefined>;
  createLessonMaterial(lessonMaterial: InsertLessonMaterial): Promise<LessonMaterial>;
  deleteLessonMaterial(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private get prisma() {
    const client = getPrisma();
    if (!client) {
      throw new Error("Database is not configured. Please set up your DATABASE_URL environment variable.");
    }
    return client;
  }

  // User methods - DEPRECATED: User table is managed by landing page via NextAuth
  // These methods are kept for backward compatibility but should not be used
  // Use NextAuth session instead
  async getUser(id: number): Promise<User | undefined> {
    // Note: User table is in another schema, cannot query directly
    // This should use NextAuth session instead
    throw new Error("getUser is deprecated. Use NextAuth session instead.");
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: User table is in another schema, cannot query directly
    // This should use NextAuth session instead
    throw new Error("getUserByUsername is deprecated. Use NextAuth session instead.");
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Note: User table is managed by landing page
    // This should not be called from teachers platform
    throw new Error("createUser is deprecated. User creation is handled by landing page.");
  }
  
  // Student methods
  async getStudents(): Promise<Student[]> {
    return await this.prisma.student.findMany();
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return await this.prisma.student.findUnique({ where: { id } }) || undefined;
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    return await this.prisma.student.create({ data: insertStudent });
  }
  
  async updateStudent(id: number, updatedFields: Partial<InsertStudent>): Promise<Student | undefined> {
    return await this.prisma.student.update({
      where: { id },
      data: updatedFields
    }) || undefined;
  }
  
  async deleteStudent(id: number): Promise<boolean> {
    try {
      await this.prisma.student.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return await this.prisma.lesson.findMany();
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return (await this.prisma.lesson.findUnique({ where: { id } })) ?? undefined;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const data = {
      ...insertLesson,
      date: new Date(insertLesson.date), // Convert string to Date
      status: insertLesson.status || undefined,
      description: insertLesson.description || null,
      location: insertLesson.location || null
    };
    return await this.prisma.lesson.create({ data });
  }

  async updateLesson(id: number, updatedFields: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const data = {
      ...updatedFields,
      date: updatedFields.date ? new Date(updatedFields.date) : undefined, // Convert string to Date if provided
      status: updatedFields.status || undefined,
      description: updatedFields.description !== undefined ? updatedFields.description || null : undefined,
      location: updatedFields.location !== undefined ? updatedFields.location || null : undefined
    };
    return (await this.prisma.lesson.update({ where: { id }, data })) ?? undefined;
  }
  
  async deleteLesson(id: number): Promise<boolean> {
    try {
      await this.prisma.lesson.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Curriculum methods
  async getCurriculumItems(): Promise<Curriculum[]> {
    const curricula = await this.prisma.curriculum.findMany();
    return curricula.map(curriculum => ({
      ...curriculum,
      description: curriculum.description,
      objectives: curriculum.objectives,
      units: curriculum.units
    })) as Curriculum[];
  }

  async getCurriculumItem(id: number): Promise<Curriculum | undefined> {
    const curriculum = await this.prisma.curriculum.findUnique({ where: { id } });
    if (!curriculum) return undefined;
    return {
      ...curriculum,
      description: curriculum.description,
      objectives: curriculum.objectives,
      units: curriculum.units
    } as Curriculum;
  }

  async createCurriculumItem(insertCurriculum: InsertCurriculum): Promise<Curriculum> {
    const data: any = {
      ...insertCurriculum,
      description: insertCurriculum.description || null,
      objectives: insertCurriculum.objectives || null
    };
    if (insertCurriculum.units !== undefined) {
      data.units = insertCurriculum.units;
    }
    const curriculum = await this.prisma.curriculum.create({ data });
    return {
      ...curriculum,
      description: curriculum.description,
      objectives: curriculum.objectives,
      units: curriculum.units
    } as Curriculum;
  }

  async updateCurriculumItem(id: number, updatedFields: Partial<InsertCurriculum>): Promise<Curriculum | undefined> {
    const data: any = {
      ...updatedFields,
      description: updatedFields.description !== undefined ? updatedFields.description || null : undefined,
      objectives: updatedFields.objectives !== undefined ? updatedFields.objectives || null : undefined
    };
    if (updatedFields.units !== undefined) {
      data.units = updatedFields.units;
    }
    const curriculum = await this.prisma.curriculum.update({
      where: { id },
      data
    });
    if (!curriculum) return undefined;
    return {
      ...curriculum,
      description: curriculum.description,
      objectives: curriculum.objectives,
      units: curriculum.units
    } as Curriculum;
  }
  
  async deleteCurriculumItem(id: number): Promise<boolean> {
    try {
      await this.prisma.curriculum.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return await this.prisma.event.findMany();
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return (await this.prisma.event.findUnique({ where: { id } })) ?? undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const data = {
      ...insertEvent,
      date: new Date(insertEvent.date), // Convert string to Date
      type: insertEvent.type || undefined,
      description: insertEvent.description || null,
      location: insertEvent.location || null
    };
    return await this.prisma.event.create({ data });
  }

  async updateEvent(id: number, updatedFields: Partial<InsertEvent>): Promise<Event | undefined> {
    const data = {
      ...updatedFields,
      date: updatedFields.date ? new Date(updatedFields.date) : undefined, // Convert string to Date if provided
      type: updatedFields.type || undefined,
      description: updatedFields.description !== undefined ? updatedFields.description || null : undefined,
      location: updatedFields.location !== undefined ? updatedFields.location || null : undefined
    };
    return (await this.prisma.event.update({ where: { id }, data })) ?? undefined;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    try {
      await this.prisma.event.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Message methods
  async getMessages(userId: number): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });
    return messages.map(message => ({
      ...message,
      isRead: message.isRead // boolean is fine as-is
    }));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) return undefined;
    return {
      ...message,
      isRead: message.isRead // boolean is fine as-is
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const data = {
      ...insertMessage,
      isRead: insertMessage.isRead || false
    };
    return await this.prisma.message.create({ data });
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = await this.prisma.message.update({
      where: { id },
      data: { isRead: true }
    });
    if (!message) return undefined;
    return {
      ...message,
      isRead: message.isRead
    };
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    try {
      await this.prisma.message.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    const announcements = await this.prisma.announcement.findMany();
    return announcements.map(announcement => ({
      ...announcement,
      priority: announcement.priority
    })) as Announcement[];
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return undefined;
    return {
      ...announcement,
      priority: announcement.priority ?? null
    };
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const data = {
      ...insertAnnouncement,
      priority: insertAnnouncement.priority || undefined
    };
    const announcement = await this.prisma.announcement.create({ data });
    return {
      ...announcement,
      priority: announcement.priority
    } as Announcement;
  }

  async updateAnnouncement(id: number, updatedFields: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const data = {
      ...updatedFields,
      priority: updatedFields.priority || undefined
    };
    const announcement = await this.prisma.announcement.update({
      where: { id },
      data
    });
    if (!announcement) return undefined;
    return {
      ...announcement,
      priority: announcement.priority
    } as Announcement;
  }
  
  async deleteAnnouncement(id: number): Promise<boolean> {
    try {
      await this.prisma.announcement.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await this.prisma.task.findMany({ where: { userId } });
  }

  async getTask(id: number): Promise<Task | undefined> {
    return (await this.prisma.task.findUnique({ where: { id } })) ?? undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const data = {
      ...insertTask,
      dueDate: insertTask.dueDate ? new Date(insertTask.dueDate) : null, // Convert string to Date or keep null
      completed: insertTask.completed || false
    };
    return await this.prisma.task.create({ data });
  }

  async updateTask(id: number, updatedFields: Partial<InsertTask>): Promise<Task | undefined> {
    const data = {
      ...updatedFields,
      dueDate: updatedFields.dueDate ? new Date(updatedFields.dueDate) : undefined, // Convert string to Date if provided
      completed: updatedFields.completed || undefined
    };
    return (await this.prisma.task.update({ where: { id }, data })) ?? undefined;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Material methods
  async getMaterials(): Promise<Material[]> {
    return await this.prisma.material.findMany();
  }
  
  async getMaterial(id: number): Promise<Material | undefined> {
    return await this.prisma.material.findUnique({ where: { id } }) || undefined;
  }
  
  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    return await this.prisma.material.create({ data: insertMaterial });
  }
  
  async updateMaterial(id: number, updatedFields: Partial<InsertMaterial>): Promise<Material | undefined> {
    return await this.prisma.material.update({
      where: { id },
      data: updatedFields
    }) || undefined;
  }
  
  async deleteMaterial(id: number): Promise<boolean> {
    try {
      await this.prisma.material.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Bookmark methods
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return await this.prisma.bookmark.findMany({ where: { userId } });
  }
  
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return await this.prisma.bookmark.findUnique({ where: { id } }) || undefined;
  }
  
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    return await this.prisma.bookmark.create({ data: insertBookmark });
  }
  
  async updateBookmark(id: number, updatedFields: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    return await this.prisma.bookmark.update({
      where: { id },
      data: updatedFields
    }) || undefined;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    try {
      await this.prisma.bookmark.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  // Lesson Materials methods
  async getLessonMaterials(lessonId: number): Promise<Material[]> {
    const lessonMaterials = await this.prisma.lessonMaterial.findMany({
      where: { lessonId },
      include: { material: true }
    });
    return lessonMaterials.map(lm => lm.material);
  }
  
  async getLessonMaterial(id: number): Promise<LessonMaterial | undefined> {
    return await this.prisma.lessonMaterial.findUnique({ where: { id } }) || undefined;
  }
  
  async createLessonMaterial(insertLessonMaterial: InsertLessonMaterial): Promise<LessonMaterial> {
    return await this.prisma.lessonMaterial.create({ data: insertLessonMaterial });
  }
  
  async deleteLessonMaterial(id: number): Promise<boolean> {
    try {
      await this.prisma.lessonMaterial.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

const storage: IStorage = new DatabaseStorage();
export { storage };
