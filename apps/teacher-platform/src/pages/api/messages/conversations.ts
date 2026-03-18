import type { NextApiRequest, NextApiResponse } from "next";
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { requireTeacherApiSession } from "@/lib/requireTeacherApiSession";
import { respondMethodNotAllowed } from "@/lib/apiResponses";
import type { Message } from "@shared/schema";

type Conversation = {
  contactId: number;
  contactName: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
};

type ConversationsResponse = {
  viewerId: number;
  conversations: Conversation[];
};

const sortByCreatedAtAsc = (a: Message, b: Message) => {
  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return dateA - dateB;
};

const sortByLastMessageDesc = (a: Conversation, b: Conversation) => {
  const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
  const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
  return dateB - dateA;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConversationsResponse | { message: string }>
) {
  const session = await requireTeacherApiSession(req, res);
  if (!session) {
    return;
  }

  if (req.method !== "GET") {
    return respondMethodNotAllowed(req, res, ["GET"]);
  }

  try {
    const viewerId = session.teacherRecordUserId;
    const allMessages = await storage.getMessages(viewerId);

    if (allMessages.length === 0) {
      return res.status(200).json({ viewerId, conversations: [] });
    }

    const contactIds = Array.from(
      new Set(
        allMessages.map((message) =>
          message.senderId === viewerId ? message.receiverId : message.senderId
        )
      )
    );

    const students = await prisma.student.findMany({
      where: { id: { in: contactIds } },
      select: {
        id: true,
        fullName: true,
        guardianName: true,
      },
    });

    const contactNamesById = new Map<number, string>(
      students.map((student) => [
        student.id,
        student.guardianName ?? student.fullName ?? "Unknown contact",
      ])
    );

    const conversations = contactIds
      .map((contactId) => {
        const messages = allMessages
          .filter(
            (message) =>
              (message.senderId === viewerId && message.receiverId === contactId) ||
              (message.receiverId === viewerId && message.senderId === contactId)
          )
          .sort(sortByCreatedAtAsc);

        if (messages.length === 0) {
          return null;
        }

        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(
          (message) => message.senderId !== viewerId && !message.isRead
        ).length;

        return {
          contactId,
          contactName: contactNamesById.get(contactId) ?? "Unknown contact",
          lastMessage,
          unreadCount,
          messages,
        };
      })
      .filter((conversation): conversation is Conversation => conversation !== null)
      .sort(sortByLastMessageDesc);

    return res.status(200).json({ viewerId, conversations });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
}
