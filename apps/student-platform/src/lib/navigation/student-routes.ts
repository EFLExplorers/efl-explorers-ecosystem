export type StudentRouteItem = {
  readonly href: string;
  readonly label: string;
};

export const STUDENT_ROUTES: readonly StudentRouteItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/lessons", label: "Lessons" },
  { href: "/progress", label: "Progress" },
  { href: "/assignments", label: "Assignments" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];
