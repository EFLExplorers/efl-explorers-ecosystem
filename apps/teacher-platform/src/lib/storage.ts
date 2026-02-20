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
import type { Prisma } from "@prisma/client";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private lessons: Map<number, Lesson>;
  private curriculumItems: Map<number, Curriculum>;
  private events: Map<number, Event>;
  private messages: Map<number, Message>;
  private announcements: Map<number, Announcement>;
  private tasks: Map<number, Task>;
  private materials: Map<number, Material>;
  private bookmarks: Map<number, Bookmark>;
  private lessonMaterialsMap: Map<number, LessonMaterial>;
  
  currentUserId: number;
  currentStudentId: number;
  currentLessonId: number;
  currentCurriculumId: number;
  currentEventId: number;
  currentMessageId: number;
  currentAnnouncementId: number;
  currentTaskId: number;
  currentMaterialId: number;
  currentBookmarkId: number;
  currentLessonMaterialId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.students = new Map();
    this.lessons = new Map();
    this.curriculumItems = new Map();
    this.events = new Map();
    this.messages = new Map();
    this.announcements = new Map();
    this.tasks = new Map();
    this.materials = new Map();
    this.bookmarks = new Map();
    this.lessonMaterialsMap = new Map();
    
    // Initialize IDs
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentLessonId = 1;
    this.currentCurriculumId = 1;
    this.currentEventId = 1;
    this.currentMessageId = 1;
    this.currentAnnouncementId = 1;
    this.currentTaskId = 1;
    this.currentMaterialId = 1;
    this.currentBookmarkId = 1;
    this.currentLessonMaterialId = 1;
    
    // Seed data (async, but we'll handle it)
    this.seedData().catch(console.error);
  }

  // Seed some initial data
  private async seedData() {
    // Create default teacher user
    const defaultUser: InsertUser = {
      username: 'teacher',
      password: 'password',
      fullName: 'John Doe',
      email: 'john.doe@teachpro.edu',
      role: 'teacher'
    };
    this.createUser(defaultUser);
    
    // Add some sample students
    const sampleStudents: InsertStudent[] = [
      {
        fullName: 'Emma Wilson',
        email: 'emma.wilson@student.edu',
        level: 'Pre A1',
        unitId: 'ESL-A1',
        guardianName: 'Sarah Wilson',
        guardianContact: '555-123-4567',
        attendanceRate: 95,
        performanceLevel: 'A',
        notes: 'Native language: Spanish. Strong verbal skills, needs work on written grammar.'
      },
      {
        fullName: 'James Miller',
        email: 'james.miller@student.edu',
        level: 'Pre A1',
        unitId: 'ESL-A1',
        guardianName: 'Robert Miller',
        guardianContact: '555-234-5678',
        attendanceRate: 88,
        performanceLevel: 'B',
        notes: 'Native language: Mandarin. Excellent reading comprehension, working on pronunciation.'
      }
    ];
    
    sampleStudents.forEach(student => this.createStudent(student));
    
    // Add some sample lessons
    const sampleLessons: InsertLesson[] = [
      {
        title: 'Daily Routines Vocabulary',
        subject: 'ESL Vocabulary',
        description: 'Learning and practicing vocabulary related to daily routines with interactive activities',
        classId: 'Pre A1',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:30',
        endTime: '11:45',
        location: 'Language Lab 1',
        status: 'upcoming'
      },
      {
        title: 'Present Simple Tense Practice',
        subject: 'ESL Grammar',
        description: 'Introduction to Present Simple tense with guided practice activities',
        classId: 'Pre A1',
        date: new Date().toISOString().split('T')[0],
        startTime: '13:15',
        endTime: '14:30',
        location: 'Language Lab 2',
        status: 'upcoming'
      }
    ];
    
    sampleLessons.forEach(lesson => this.createLesson(lesson));
    
    // Add sample curriculum items
    const sampleCurriculum: InsertCurriculum[] = [
      {
        title: 'ESL Curriculum - Pre A1 Level',
        subject: 'English as a Second Language',
        level: 'Pre A1',
        description: 'Foundational English language curriculum for beginner ESL students',
        objectives: 'Students will build fundamental English language skills for basic communication needs',
        units: [
          {
            title: 'Unit 1: Introduction to English',
            lessons: [
              { id: 1, title: 'Greetings and Introductions' },
              { id: 2, title: 'Classroom Language' }
            ]
          },
          {
            title: 'Unit 2: Daily Routines',
            lessons: [
              { id: 3, title: 'Daily Routines Vocabulary' },
              { id: 4, title: 'Present Simple Tense' }
            ]
          },
          {
            title: 'Unit 3: Colors and Numbers',
            lessons: [
              { id: 5, title: 'Basic Colors' },
              { id: 6, title: 'Numbers 1-20' }
            ]
          },
          {
            title: 'Unit 4: Family',
            lessons: [
              { id: 7, title: 'Family Members' },
              { id: 8, title: 'Possessive Adjectives' }
            ]
          },
          {
            title: 'Unit 5: Food and Drink',
            lessons: [
              { id: 9, title: 'Food Vocabulary' },
              { id: 10, title: 'Expressing Likes and Dislikes' }
            ]
          },
          {
            title: 'Unit 6: Animals',
            lessons: [
              { id: 11, title: 'Pets and Farm Animals' },
              { id: 12, title: 'Simple Adjectives' }
            ]
          },
          {
            title: 'Unit 7: Weather',
            lessons: [
              { id: 13, title: 'Weather Types' },
              { id: 14, title: 'Seasons Vocabulary' }
            ]
          },
          {
            title: 'Unit 8: Clothes',
            lessons: [
              { id: 15, title: 'Basic Clothing Items' },
              { id: 16, title: 'Colors and Clothes' }
            ]
          },
          {
            title: 'Unit 9: My House',
            lessons: [
              { id: 17, title: 'Rooms in a House' },
              { id: 18, title: 'Furniture Vocabulary' }
            ]
          },
          {
            title: 'Unit 10: Transportation',
            lessons: [
              { id: 19, title: 'Transport Vocabulary' },
              { id: 20, title: 'Getting Around' }
            ]
          }
        ]
      }
    ];
    
    sampleCurriculum.forEach(curr => this.createCurriculumItem(curr));
    
    // Add sample tasks
    const sampleTasks: InsertTask[] = [
      {
        title: 'Grade Pre A1 vocabulary worksheets',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        userId: 1
      },
      {
        title: 'Prepare flashcards for Daily Routines lesson',
        completed: false,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // tomorrow
        userId: 1
      }
    ];
    
    sampleTasks.forEach(task => this.createTask(task));
    
    // Add sample announcements
    const sampleAnnouncements: InsertAnnouncement[] = [
      {
        title: 'ESL Teaching Methods Workshop',
        content: 'Reminder: No classes on Friday due to scheduled ESL teaching methods workshop. All language teachers are required to attend. Focus will be on interactive learning approaches.',
        priority: 'high',
        createdBy: 1
      },
      {
        title: 'Language Progress Reports Due',
        content: 'All student language assessment reports for the current quarter must be submitted by next Wednesday. Contact the ESL department head for any extensions.',
        priority: 'normal',
        createdBy: 1
      }
    ];
    
    sampleAnnouncements.forEach(announcement => this.createAnnouncement(announcement));
    
    // Add sample materials
    const sampleMaterials: InsertMaterial[] = [
      {
        title: 'Daily Routines Vocabulary Flashcards',
        description: 'A set of visual flashcards showing daily routine activities with English vocabulary',
        category: 'Flashcards',
        url: '/materials/daily-routines-flashcards.pdf',
        createdBy: 1
      },
      {
        title: 'Present Simple Grammar Worksheet',
        description: 'Practice worksheet for Present Simple tense with fill-in-the-blank exercises',
        category: 'Worksheet',
        url: '/materials/present-simple-worksheet.pdf',
        createdBy: 1
      },
      {
        title: 'Morning Routine Speaking Activity',
        description: 'Pair work activity where students practice describing their morning routines',
        category: 'Speaking Activity',
        url: '/materials/morning-routine-speaking.pdf',
        createdBy: 1
      }
    ];
    
    // Create materials and link them to lessons
    for (const material of sampleMaterials) {
      const createdMaterial = await this.createMaterial(material);
      
      // Link flashcards to Daily Routines lesson
      if (material.title.includes('Flashcards')) {
        await this.createLessonMaterial({
          lessonId: 1,
          materialId: createdMaterial.id
        });
      }
      
      // Link worksheet to Present Simple lesson
      if (material.title.includes('Grammar Worksheet')) {
        await this.createLessonMaterial({
          lessonId: 2,
          materialId: createdMaterial.id
        });
      }
      
      // Link speaking activity to both lessons
      if (material.title.includes('Speaking Activity')) {
        await this.createLessonMaterial({
          lessonId: 1,
          materialId: createdMaterial.id
        });
        await this.createLessonMaterial({
          lessonId: 2,
          materialId: createdMaterial.id
        });
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role ?? null,
      avatarUrl: insertUser.avatarUrl ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { 
      ...insertStudent, 
      id, 
      createdAt: new Date(),
      email: insertStudent.email ?? null,
      nativeLanguage: insertStudent.nativeLanguage ?? null,
      guardianName: insertStudent.guardianName ?? null,
      guardianContact: insertStudent.guardianContact ?? null,
      attendanceRate: insertStudent.attendanceRate ?? null,
      performanceLevel: insertStudent.performanceLevel ?? null,
      notes: insertStudent.notes ?? null
    };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudent(id: number, updatedFields: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updatedFields };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }
  
  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const now = new Date();
    const lesson: Lesson = { 
      ...insertLesson, 
      id, 
      createdAt: now,
      updatedAt: now,
      description: insertLesson.description ?? null,
      location: insertLesson.location ?? null,
      status: insertLesson.status ?? null
    };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  async updateLesson(id: number, updatedFields: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const updatedLesson = { 
      ...lesson, 
      ...updatedFields,
      updatedAt: new Date()
    };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }
  
  async deleteLesson(id: number): Promise<boolean> {
    return this.lessons.delete(id);
  }
  
  // Curriculum methods
  async getCurriculumItems(): Promise<Curriculum[]> {
    return Array.from(this.curriculumItems.values());
  }
  
  async getCurriculumItem(id: number): Promise<Curriculum | undefined> {
    return this.curriculumItems.get(id);
  }
  
  async createCurriculumItem(insertCurriculum: InsertCurriculum): Promise<Curriculum> {
    const id = this.currentCurriculumId++;
    const now = new Date();
    const curriculum: Curriculum = { 
      ...insertCurriculum, 
      id, 
      createdAt: now,
      updatedAt: now,
      description: insertCurriculum.description ?? null,
      objectives: insertCurriculum.objectives ?? null,
      units: insertCurriculum.units ?? null
    };
    this.curriculumItems.set(id, curriculum);
    return curriculum;
  }
  
  async updateCurriculumItem(id: number, updatedFields: Partial<InsertCurriculum>): Promise<Curriculum | undefined> {
    const curriculumItem = this.curriculumItems.get(id);
    if (!curriculumItem) return undefined;
    
    const updatedItem = { 
      ...curriculumItem, 
      ...updatedFields,
      updatedAt: new Date()
    };
    this.curriculumItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteCurriculumItem(id: number): Promise<boolean> {
    return this.curriculumItems.delete(id);
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: new Date(),
      description: insertEvent.description ?? null,
      location: insertEvent.location ?? null,
      type: insertEvent.type ?? null
    };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, updatedFields: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updatedFields };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Message methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.senderId === userId || message.receiverId === userId
    );
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      isRead: insertMessage.isRead ?? false
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }
  
  // Announcement methods
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values());
  }
  
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }
  
  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const announcement: Announcement = { 
      ...insertAnnouncement, 
      id, 
      createdAt: new Date(),
      priority: insertAnnouncement.priority ?? null
    };
    this.announcements.set(id, announcement);
    return announcement;
  }
  
  async updateAnnouncement(id: number, updatedFields: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;
    
    const updatedAnnouncement = { ...announcement, ...updatedFields };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.userId === userId
    );
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      completed: insertTask.completed ?? false,
      dueDate: insertTask.dueDate ?? null
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, updatedFields: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updatedFields };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Material methods
  async getMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values());
  }
  
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }
  
  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.currentMaterialId++;
    const material: Material = { 
      ...insertMaterial, 
      id, 
      createdAt: new Date(),
      description: insertMaterial.description ?? null
    };
    this.materials.set(id, material);
    return material;
  }
  
  async updateMaterial(id: number, updatedFields: Partial<InsertMaterial>): Promise<Material | undefined> {
    const material = this.materials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial = { ...material, ...updatedFields };
    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }
  
  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }
  
  // Bookmark methods
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      bookmark => bookmark.userId === userId
    );
  }
  
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    return this.bookmarks.get(id);
  }
  
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id, 
      createdAt: new Date(),
      category: insertBookmark.category ?? null
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }
  
  async updateBookmark(id: number, updatedFields: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark) return undefined;
    
    const updatedBookmark = { ...bookmark, ...updatedFields };
    this.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }
  
  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }
  
  // Lesson Materials methods
  
  async getLessonMaterials(lessonId: number): Promise<Material[]> {
    // Find all lesson materials for this lesson
    const lessonMaterialsForLesson = Array.from(this.lessonMaterialsMap.values())
      .filter(lm => lm.lessonId === lessonId);
    
    // Get the corresponding materials
    return lessonMaterialsForLesson
      .map(lm => this.materials.get(lm.materialId))
      .filter(Boolean) as Material[];
  }
  
  async getLessonMaterial(id: number): Promise<LessonMaterial | undefined> {
    return this.lessonMaterialsMap.get(id);
  }
  
  async createLessonMaterial(insertLessonMaterial: InsertLessonMaterial): Promise<LessonMaterial> {
    const id = this.currentLessonMaterialId++;
    const lessonMaterial: LessonMaterial = { 
      ...insertLessonMaterial, 
      id, 
      createdAt: new Date()
    };
    this.lessonMaterialsMap.set(id, lessonMaterial);
    return lessonMaterial;
  }
  
  async deleteLessonMaterial(id: number): Promise<boolean> {
    return this.lessonMaterialsMap.delete(id);
  }
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
    const lessons = await this.prisma.lesson.findMany();
    return lessons.map(lesson => ({
      ...lesson,
      date: lesson.date.toISOString().split('T')[0], // Convert Date to string format
      status: lesson.status,
      description: lesson.description,
      location: lesson.location
    })) as Lesson[];
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return undefined;
    return {
      ...lesson,
      date: lesson.date.toISOString().split('T')[0], // Convert Date to string format
      status: lesson.status,
      description: lesson.description,
      location: lesson.location
    } as Lesson;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const data = {
      ...insertLesson,
      date: new Date(insertLesson.date), // Convert string to Date
      status: insertLesson.status || undefined,
      description: insertLesson.description || null,
      location: insertLesson.location || null
    };
    const lesson = await this.prisma.lesson.create({ data });
    return {
      ...lesson,
      date: lesson.date.toISOString().split('T')[0], // Convert back to string
      status: lesson.status,
      description: lesson.description,
      location: lesson.location
    } as Lesson;
  }

  async updateLesson(id: number, updatedFields: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const data = {
      ...updatedFields,
      date: updatedFields.date ? new Date(updatedFields.date) : undefined, // Convert string to Date if provided
      status: updatedFields.status || undefined,
      description: updatedFields.description !== undefined ? updatedFields.description || null : undefined,
      location: updatedFields.location !== undefined ? updatedFields.location || null : undefined
    };
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data
    });
    if (!lesson) return undefined;
    return {
      ...lesson,
      date: lesson.date.toISOString().split('T')[0], // Convert back to string
      status: lesson.status,
      description: lesson.description,
      location: lesson.location
    } as Lesson;
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
    const events = await this.prisma.event.findMany();
    return events.map(event => ({
      ...event,
      date: event.date.toISOString().split('T')[0], // Convert Date to string format
      type: event.type,
      description: event.description,
      location: event.location
    })) as Event[];
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) return undefined;
    return {
      ...event,
      date: event.date.toISOString().split('T')[0], // Convert Date to string format
      type: event.type ?? null,
      description: event.description ?? null,
      location: event.location ?? null
    };
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const data = {
      ...insertEvent,
      date: new Date(insertEvent.date), // Convert string to Date
      type: insertEvent.type || undefined,
      description: insertEvent.description || null,
      location: insertEvent.location || null
    };
    const event = await this.prisma.event.create({ data });
    return {
      ...event,
      date: event.date.toISOString().split('T')[0], // Convert back to string
      type: event.type,
      description: event.description,
      location: event.location
    } as Event;
  }

  async updateEvent(id: number, updatedFields: Partial<InsertEvent>): Promise<Event | undefined> {
    const data = {
      ...updatedFields,
      date: updatedFields.date ? new Date(updatedFields.date) : undefined, // Convert string to Date if provided
      type: updatedFields.type || undefined,
      description: updatedFields.description !== undefined ? updatedFields.description || null : undefined,
      location: updatedFields.location !== undefined ? updatedFields.location || null : undefined
    };
    const event = await this.prisma.event.update({
      where: { id },
      data
    });
    if (!event) return undefined;
    return {
      ...event,
      date: event.date.toISOString().split('T')[0], // Convert back to string
      type: event.type,
      description: event.description,
      location: event.location
    } as Event;
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
    const tasks = await this.prisma.task.findMany({ where: { userId } });
    return tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null, // Convert Date to string or keep null
      completed: task.completed // boolean is fine as-is
    }));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) return undefined;
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null, // Convert Date to string or keep null
      completed: task.completed
    };
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const data = {
      ...insertTask,
      dueDate: insertTask.dueDate ? new Date(insertTask.dueDate) : null, // Convert string to Date or keep null
      completed: insertTask.completed || false
    };
    const task = await this.prisma.task.create({ data });
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null, // Convert back to string
      completed: task.completed
    };
  }

  async updateTask(id: number, updatedFields: Partial<InsertTask>): Promise<Task | undefined> {
    const data = {
      ...updatedFields,
      dueDate: updatedFields.dueDate ? new Date(updatedFields.dueDate) : undefined, // Convert string to Date if provided
      completed: updatedFields.completed || undefined
    };
    const task = await this.prisma.task.update({
      where: { id },
      data
    });
    if (!task) return undefined;
    return {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null, // Convert back to string
      completed: task.completed
    };
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

export async function seedInitialData() {
  if (!process.env.DATABASE_URL) {
    console.warn("Skipping database seed: DATABASE_URL not set.");
    return;
  }

  try {
    const prismaClient = getPrisma();
    if (!prismaClient) {
      console.warn("Cannot seed database - Prisma client not available");
      return;
    }

    // Note: User table is managed by landing page via NextAuth
    // We cannot create users here - they must be created through the landing page
    // For seeding, we'll use userId = 1 as a placeholder (assuming it exists)
    const defaultUserId = 1;
  
    // Check if we have students
    const studentCount = await prismaClient.student.count();
    if (studentCount === 0) {
      // Add some sample ESL students
      await prismaClient.student.createMany({
        data: [
      {
        fullName: 'Sofia García',
        email: 'sofia.garcia@student.edu',
        level: 'Pre-A1',
        unitId: 'Unit1',
        guardianName: 'Miguel García',
        guardianContact: '555-123-4567',
        attendanceRate: 95,
        performanceLevel: 'A',
        notes: 'Beginner English learner, native Spanish speaker'
      },
      {
        fullName: 'Ling Wei',
        email: 'ling.wei@student.edu',
        level: 'Pre-A1',
        unitId: 'Unit2',
        guardianName: 'Zhang Wei',
        guardianContact: '555-234-5678',
        attendanceRate: 88,
        performanceLevel: 'B',
        notes: 'Beginner English learner, native Mandarin speaker'
      },
      {
        fullName: 'Ahmed Al-Farsi',
        email: 'ahmed.alfarsi@student.edu',
        level: 'A1',
        unitId: 'Unit1',
        guardianName: 'Samir Al-Farsi',
        guardianContact: '555-345-6789',
        attendanceRate: 92,
        performanceLevel: 'A',
        notes: 'Elementary English learner, native Arabic speaker'
      },
      {
        fullName: 'Yuri Petrov',
        email: 'yuri.petrov@student.edu',
        level: 'A2',
        unitId: 'Unit3',
        guardianName: 'Natasha Petrova',
        guardianContact: '555-456-7890',
        attendanceRate: 90,
        performanceLevel: 'B+',
        notes: 'Pre-intermediate English learner, native Russian speaker'
        }
      ]
      });
    }
  
    // Check if we have lessons
    const lessonCount = await prismaClient.lesson.count();
    if (lessonCount === 0) {
      // Add some sample ESL lessons
      await prismaClient.lesson.createMany({
        data: [
          {
            title: 'Daily Routines and Present Simple',
            subject: 'ESL',
            description: 'Practicing vocabulary and grammar related to daily routines using Present Simple tense',
            classId: 'Pre-A1',
            date: new Date(),
            startTime: '10:30',
            endTime: '11:45',
            location: 'Room 102',
            status: 'upcoming'
          },
          {
            title: 'Food and Drink Vocabulary',
            subject: 'ESL',
            description: 'Introduction to basic food and drink vocabulary with speaking practice',
            classId: 'A1',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            startTime: '13:15',
            endTime: '14:30',
            location: 'Room 205',
            status: 'upcoming'
          },
          {
            title: 'Giving Directions - City Navigation',
            subject: 'ESL',
            description: 'Practicing prepositions and imperative form through city navigation role-play',
            classId: 'A2',
            date: new Date(Date.now() + 48 * 60 * 60 * 1000),
            startTime: '09:00',
            endTime: '10:15',
            location: 'Room 103',
            status: 'upcoming'
          }
        ]
      });
    }
  
    // Check if we have curriculum items
    const curriculumCount = await prismaClient.curriculum.count();
    if (curriculumCount === 0) {
      // Add sample ESL curriculum items
      await prismaClient.curriculum.createMany({
        data: [
      {
        title: 'ESL Curriculum - Pre-A1 Level',
        subject: 'ESL',
        level: 'Pre-A1',
        description: 'Beginner level English curriculum for Pre-A1 students',
        objectives: 'Students will learn basic vocabulary, simple grammatical structures, and develop confidence in simple conversations',
        units: [
          {
            title: 'Unit 1: Personal Information',
            lessons: [
              { id: 1, title: 'Greetings and Introductions' },
              { id: 2, title: 'Numbers and Personal Details' }
            ]
          },
          {
            title: 'Unit 2: Daily Life',
            lessons: [
              { id: 3, title: 'Daily Routines and Present Simple' },
              { id: 4, title: 'Time and Days of the Week' }
            ]
          },
          {
            title: 'Unit 3: Food and Drink',
            lessons: [
              { id: 5, title: 'Food and Drink Vocabulary' },
              { id: 6, title: 'Ordering in a Restaurant' }
            ]
          }
        ]
      },
      {
        title: 'ESL Curriculum - A1 Level',
        subject: 'ESL',
        level: 'A1',
        description: 'Elementary level English curriculum for A1 students',
        objectives: 'Students will expand vocabulary, learn basic tenses, and engage in structured conversations',
        units: [
          {
            title: 'Unit 1: Home and Family',
            lessons: [
              { id: 1, title: 'Family Members and Relations' },
              { id: 2, title: 'Describing Your Home' }
            ]
          },
          {
            title: 'Unit 2: Travel and Transport',
            lessons: [
              { id: 3, title: 'Transportation Vocabulary' },
              { id: 4, title: 'Giving Directions - City Navigation' }
            ]
          }
        ]
        }
      ]
      });
    }
  
    // Check if we have materials (using placeholder userId)
    const materialCount = await prismaClient.material.count();
    if (materialCount === 0) {
      // Add sample materials
      const addedMaterials = await Promise.all([
        prismaClient.material.create({
          data: {
            title: 'Daily Routines Vocabulary Flashcards',
            description: 'A set of visual flashcards showing daily routine activities with English vocabulary',
            category: 'Flashcards',
            url: '/materials/daily-routines-flashcards.pdf',
            createdBy: defaultUserId
          }
        }),
        prismaClient.material.create({
          data: {
            title: 'Present Simple Grammar Worksheet',
            description: 'Practice worksheet for Present Simple tense with fill-in-the-blank exercises',
            category: 'Worksheet',
            url: '/materials/present-simple-worksheet.pdf',
            createdBy: defaultUserId
          }
        }),
        prismaClient.material.create({
          data: {
            title: 'Morning Routine Speaking Activity',
            description: 'Pair work activity where students practice describing their morning routines',
            category: 'Speaking Activity',
            url: '/materials/morning-routine-speaking.pdf',
            createdBy: defaultUserId
          }
        })
      ]);
      
      // Get lessons to link materials to
      const lessonsList = await prismaClient.lesson.findMany();
      if (lessonsList.length >= 2 && addedMaterials.length >= 3) {
        const flashcardMaterial = addedMaterials[0];
        const worksheetMaterial = addedMaterials[1];
        const speakingActivityMaterial = addedMaterials[2];
        const firstLesson = lessonsList[0];
        const secondLesson = lessonsList[1];
        
        // Link flashcards to first lesson
        await prismaClient.lessonMaterial.create({
          data: {
            lessonId: firstLesson.id,
            materialId: flashcardMaterial.id
          }
        });
        
        // Link worksheet to second lesson
        await prismaClient.lessonMaterial.create({
          data: {
            lessonId: secondLesson.id,
            materialId: worksheetMaterial.id
          }
        });
        
        // Link speaking activity to both lessons
        await prismaClient.lessonMaterial.createMany({
          data: [
            {
              lessonId: firstLesson.id,
              materialId: speakingActivityMaterial.id
            },
            {
              lessonId: secondLesson.id,
              materialId: speakingActivityMaterial.id
            }
          ]
        });
      }
    }
    
    // Check if we have tasks
    const taskCount = await prismaClient.task.count();
    if (taskCount === 0) {
      // Add sample tasks
      await prismaClient.task.createMany({
        data: [
          {
            title: 'Grade Pre A1 English vocabulary worksheets',
            completed: false,
            dueDate: new Date(),
            userId: defaultUserId
          },
          {
            title: 'Prepare flashcards for Daily Routines lesson',
            completed: false,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
            userId: defaultUserId
          },
          {
            title: 'Review student speaking assessments',
            completed: false,
            dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // day after tomorrow
            userId: defaultUserId
          }
        ]
      });
    }
    
    // Check if we have announcements
    const announcementCount = await prismaClient.announcement.count();
    if (announcementCount === 0) {
      // Add sample ESL-related announcements
      await prismaClient.announcement.createMany({
        data: [
          {
            title: 'ESL Teacher Professional Development Day',
            content: 'Reminder: No classes on Friday due to ESL teaching methodology workshop. All ESL teachers are required to attend for CEFR alignment training.',
            priority: 'high',
            createdBy: defaultUserId
          },
          {
            title: 'CEFR Assessment Guidelines Update',
            content: 'New Common European Framework (CEFR) assessment guidelines have been published. Please review the updated rubrics for speaking and writing assessments.',
            priority: 'normal',
            createdBy: defaultUserId
          },
          {
            title: 'New ESL Learning Materials Available',
            content: 'The digital resource library has been updated with new interactive materials for Pre-A1 and A1 level students. Access them through the Materials section.',
            priority: 'normal',
            createdBy: defaultUserId
          }
        ]
      });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

let storage: IStorage;

// Try to use database storage, fall back to in-memory if it fails
try {
  const prismaClient = getPrisma();
  if (prismaClient && process.env.DATABASE_URL) {
    // Initialize the database with seed data
    seedInitialData().catch(console.error);
    storage = new DatabaseStorage();
  } else {
    throw new Error("Database not available");
  }
} catch (error) {
  // Only log warnings in development, suppress during build/production
  if (process.env.NODE_ENV === "development") {
    console.warn("Database not configured or unavailable; using in-memory storage (non-persistent).");
    console.warn("To enable database features, configure your DATABASE_URL environment variable.");
  }
  storage = new MemStorage();
}

export { storage };
