'use client';

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  Send, 
  Megaphone, 
  PlusCircle, 
  ChevronDown, 
  Bell,
  UserCog
} from "lucide-react";
import { Message, Announcement } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { formatDistanceToNow } from "date-fns";
import { classNames } from "@/utils/classNames";
import styles from './messages.module.css';

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

export default function MessagesPage() {
  const [tab, setTab] = useState("messages");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");

  const { data: conversationsData, isLoading: messagesLoading } = useQuery<ConversationsResponse>({
    queryKey: ["/api/messages/conversations"]
  });
  
  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"]
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { receiverId: number; content: string; }) => {
      await apiRequest('POST', '/api/messages', newMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setMessageText("");
    }
  });
  
  const createAnnouncementMutation = useMutation({
    mutationFn: async (newAnnouncement: { title: string; content: string; priority: string; }) => {
      await apiRequest('POST', '/api/announcements', newAnnouncement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementPriority("normal");
    }
  });
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: messageText
    });
  };
  
  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    
    createAnnouncementMutation.mutate({
      title: announcementTitle,
      content: announcementContent,
      priority: announcementPriority
    });
  };
  
  const viewerId = conversationsData?.viewerId ?? null;
  const conversations =
    conversationsData?.conversations.filter((conversation) =>
      !searchText || conversation.contactName.toLowerCase().includes(searchText.toLowerCase())
    ) ?? [];
  
  const selectedConversationData = conversations?.find(c => c.contactId === selectedConversation);
  
  const getTimeAgo = (date: Date | null) => {
    if (!date) return "unknown time";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className={styles.badgeHigh}>Important</Badge>;
      case 'medium':
        return <Badge variant="outline" className={styles.badgeMedium}>Medium</Badge>;
      default:
        return <Badge variant="outline" className={styles.badgeGeneral}>General</Badge>;
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Messages</h1>
          <p className={styles.subtitle}>Manage your communications and announcements</p>
        </div>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className={styles.tabsContent}>
          <div className={styles.messagesGrid}>
            <Card className={styles.conversationsCard}>
              <CardHeader className={styles.conversationsHeader}>
                <div className={styles.searchWrapper}>
                  <Search className={styles.searchIcon} />
                  <Input
                    placeholder="Search conversations..."
                    className={styles.searchInput}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className={styles.conversationsContent}>
                {messagesLoading ? (
                  <div className={styles.emptyState}>Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className={styles.emptyState}>No conversations found</div>
                ) : (
                  <div className={styles.conversationsList}>
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.contactId}
                        className={classNames(
                          styles.conversationItem,
                          selectedConversation === conversation.contactId && styles.conversationItemActive
                        )}
                        onClick={() => setSelectedConversation(conversation.contactId)}
                      >
                        <div className={styles.conversationContent}>
                          <Avatar className={styles.conversationAvatar}>
                            <AvatarFallback className={styles.avatarFallback}>
                              {conversation.contactName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={styles.conversationInfo}>
                            <div className={styles.conversationHeader}>
                              <h4 className={styles.conversationName}>{conversation.contactName}</h4>
                              <span className={styles.conversationTime}>{getTimeAgo(conversation.lastMessage.createdAt)}</span>
                            </div>
                            <p className={styles.conversationPreview}>
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className={styles.unreadBadge}>
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className={styles.chatCard}>
              {selectedConversation ? (
                <>
                  <CardHeader className={styles.chatHeader}>
                    <div className={styles.chatHeaderContent}>
                      <Avatar className={styles.chatAvatar}>
                        <AvatarFallback className={styles.avatarFallback}>
                          {selectedConversationData?.contactName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className={styles.chatName}>{selectedConversationData?.contactName}</h3>
                        <p className={styles.chatRole}>Parent/Guardian</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className={styles.chatContent}>
                    <div className={styles.messagesList}>
                      {selectedConversationData?.messages.map((msg, index) => (
                        <div 
                          key={index}
                          className={classNames(
                            styles.messageWrapper,
                            msg.senderId === viewerId ? styles.messageWrapperSent : styles.messageWrapperReceived
                          )}
                        >
                          <div 
                            className={classNames(
                              styles.messageBubble,
                              msg.senderId === viewerId ? styles.messageBubbleSent : styles.messageBubbleReceived
                            )}
                          >
                            <p>{msg.content}</p>
                            <p className={classNames(
                              styles.messageTime,
                              msg.senderId === viewerId ? styles.messageTimeSent : styles.messageTimeReceived
                            )}>
                              {getTimeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className={styles.chatFooter}>
                    <div className={styles.messageInputWrapper}>
                      <Input
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className={styles.messageInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className={styles.sendButton}
                        disabled={!messageText.trim() || sendMessageMutation.isPending}
                      >
                        <Send className={styles.sendIcon} />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              ) : (
                <div className={styles.emptyChat}>
                  <div className={styles.emptyChatIcon}>
                    <Send className={styles.emptyIcon} />
                  </div>
                  <h3 className={styles.emptyChatTitle}>No Conversation Selected</h3>
                  <p className={styles.emptyChatText}>
                    Select a conversation from the left to view messages or start a new conversation.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="announcements" className={styles.tabsContent}>
          <div className={styles.announcementsGrid}>
            <div className={styles.announcementsList}>
              <Card className={styles.announcementsCard}>
                <CardHeader className={styles.announcementsHeader}>
                  <h2 className={styles.announcementsTitle}>All Announcements</h2>
                </CardHeader>
                
                <CardContent className={styles.announcementsContent}>
                  {announcementsLoading ? (
                    <div className={styles.emptyState}>Loading announcements...</div>
                  ) : announcements?.length === 0 ? (
                    <div className={styles.emptyState}>No announcements found</div>
                  ) : (
                    <div className={styles.announcementsListItems}>
                      {announcements?.map((announcement) => (
                        <div key={announcement.id} className={styles.announcementItem}>
                          <div className={styles.announcementHeader}>
                            {getPriorityBadge(announcement.priority)}
                            <span className={styles.announcementTime}>
                              {getTimeAgo(announcement.createdAt)}
                            </span>
                          </div>
                          <h3 className={styles.announcementItemTitle}>{announcement.title}</h3>
                          <p className={styles.announcementItemContent}>{announcement.content}</p>
                          <div className={styles.announcementActions}>
                            <div className={styles.announcementAuthor}>
                              Posted by: Admin
                            </div>
                            <div className={styles.announcementButtons}>
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className={styles.deleteButton}>Delete</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className={styles.createAnnouncement}>
              <Card className={styles.createCard}>
                <CardHeader className={styles.createHeader}>
                  <div className={styles.createHeaderContent}>
                    <Megaphone className={styles.createHeaderIcon} />
                    <h2 className={styles.createTitle}>Create Announcement</h2>
                  </div>
                </CardHeader>
                
                <CardContent className={styles.createContent}>
                  <div className={styles.createForm}>
                    <div className={styles.formField}>
                      <label htmlFor="title" className={styles.formLabel}>
                        Title
                      </label>
                      <Input
                        id="title"
                        placeholder="Announcement title"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label htmlFor="content" className={styles.formLabel}>
                        Content
                      </label>
                      <Textarea
                        id="content"
                        placeholder="Announcement content"
                        rows={5}
                        value={announcementContent}
                        onChange={(e) => setAnnouncementContent(e.target.value)}
                      />
                    </div>
                    
                    <div className={styles.formField}>
                      <label htmlFor="priority" className={styles.formLabel}>
                        Priority
                      </label>
                      <Select value={announcementPriority} onValueChange={setAnnouncementPriority}>
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">General</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">Important</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className={styles.formSubmit}>
                      <Button 
                        className={styles.submitButton}
                        onClick={handleCreateAnnouncement}
                        disabled={!announcementTitle.trim() || !announcementContent.trim() || createAnnouncementMutation.isPending}
                      >
                        {createAnnouncementMutation.isPending ? "Creating..." : "Create Announcement"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className={styles.tabsContent}>
          <Card className={styles.settingsCard}>
            <CardHeader className={styles.settingsHeader}>
              <div className={styles.settingsHeaderContent}>
                <Bell className={styles.settingsHeaderIcon} />
                <h2 className={styles.settingsTitle}>Notification Preferences</h2>
              </div>
            </CardHeader>
            
            <CardContent className={styles.settingsContent}>
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsSectionTitle}>Email Notifications</h3>
                <div className={styles.settingsList}>
                  {["New messages", "Student updates", "Announcements", "Calendar events", "System updates"].map((item, index) => (
                    <div key={index} className={styles.settingItem}>
                      <span className={styles.settingLabel}>{item}</span>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          defaultChecked={index < 3}
                          className={styles.switchInput}
                          aria-label={item}
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsSectionTitle}>In-App Notifications</h3>
                <div className={styles.settingsList}>
                  {["Direct messages", "Mentions", "Assignment submissions", "Reminders", "System notifications"].map((item, index) => (
                    <div key={index} className={styles.settingItem}>
                      <span className={styles.settingLabel}>{item}</span>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          defaultChecked
                          className={styles.switchInput}
                          aria-label={item}
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsSectionTitle}>Communication Preferences</h3>
                <div className={styles.settingsForm}>
                  <div className={styles.formField}>
                    <label htmlFor="message-frequency" className={styles.formLabel}>
                      Message Digest Frequency
                    </label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="message-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className={styles.formField}>
                    <label htmlFor="quiet-hours" className={styles.formLabel}>
                      Quiet Hours
                    </label>
                    <div className={styles.quietHoursGrid}>
                      <Select defaultValue="8pm">
                        <SelectTrigger id="quiet-hours-start">
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {["6pm", "7pm", "8pm", "9pm", "10pm"].map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="7am">
                        <SelectTrigger id="quiet-hours-end">
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          {["5am", "6am", "7am", "8am", "9am"].map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.settingsFooter}>
                <Button className={styles.saveButton}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
