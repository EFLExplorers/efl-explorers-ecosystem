import { prisma } from "@repo/database";

import type { IdentityBridgeData } from "@/types/db-visualizer";

const USERS_LIMIT = 150;

export const getIdentityBridgeData = async (
  selectedUserId?: string
): Promise<IdentityBridgeData> => {
  const users = await prisma.user.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: USERS_LIMIT,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      approved: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (users.length === 0) {
    return {
      users: [],
      selectedUser: null,
      studentMapping: null,
      teacherMapping: null,
      linkedStudents: [],
    };
  }

  const defaultUserId = users[0]?.id;
  const effectiveUserId = selectedUserId ?? defaultUserId;

  if (!effectiveUserId) {
    return {
      users,
      selectedUser: null,
      studentMapping: null,
      teacherMapping: null,
      linkedStudents: [],
    };
  }

  const selectedUser = users.find((user) => user.id === effectiveUserId);
  if (!selectedUser) {
    return {
      users,
      selectedUser: null,
      studentMapping: null,
      teacherMapping: null,
      linkedStudents: [],
    };
  }

  const [studentMapping, teacherMapping, linkedStudents] = await Promise.all([
    prisma.studentUserMapping.findUnique({
      where: { authUserId: selectedUser.id },
      select: {
        id: true,
        authUserId: true,
        createdAt: true,
      },
    }),
    prisma.teacherUserMapping.findUnique({
      where: { authUserId: selectedUser.id },
      select: {
        id: true,
        authUserId: true,
        createdAt: true,
      },
    }),
    selectedUser.email
      ? prisma.student.findMany({
          where: { email: selectedUser.email },
          select: {
            id: true,
            fullName: true,
            email: true,
            level: true,
            unitId: true,
            performanceLevel: true,
            attendanceRate: true,
          },
          orderBy: { id: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    users,
    selectedUser,
    studentMapping,
    teacherMapping,
    linkedStudents,
  };
};
