export type Platform = "student" | "teacher";

export const getPlatformUrl = (platform: Platform): string => {
  switch (platform) {
    case "student":
      return process.env.NEXT_PUBLIC_STUDENT_URL || "";
    case "teacher":
      return process.env.NEXT_PUBLIC_TEACHER_URL || "";
    default:
      return "";
  }
};
