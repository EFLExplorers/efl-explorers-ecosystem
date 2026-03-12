export type StudentRouteItem = {
  readonly href: string;
  readonly label: string;
  readonly hint: string;
};

export const STUDENT_ROUTES: readonly StudentRouteItem[] = [
  { href: "/", label: "Home Base", hint: "See your next mission" },
  { href: "/lessons", label: "Lesson Path", hint: "Follow your discoveries" },
  { href: "/progress", label: "Star Journey", hint: "Track your checkpoints" },
  { href: "/assignments", label: "Missions", hint: "Complete priority tasks" },
  { href: "/profile", label: "My Explorer", hint: "Your learner profile" },
  { href: "/settings", label: "My Controls", hint: "Choose your preferences" },
];
