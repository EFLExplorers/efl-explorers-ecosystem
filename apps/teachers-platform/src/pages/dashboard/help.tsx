'use client';

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  HelpCircle,
  BookOpen,
  MessageSquare,
  Video,
  FileText,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  X
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { classNames } from "@/utils/classNames";
import styles from './help.module.css';

export default function HelpPage() {
  const [search, setSearch] = useState("");

  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      topics: [
        {
          question: "How do I create my first lesson?",
          answer: "Navigate to the Lessons page and click the 'Create Lesson' button. Fill in the lesson details including subject, date, time, and select your students. You can also add materials and resources to your lesson."
        },
        {
          question: "How do I add students to my class?",
          answer: "Go to the Students page and click 'Add Student'. Fill in the student's information including name, email, and guardian contact details. You can also assign students to specific levels and courses."
        },
        {
          question: "How do I access the curriculum?",
          answer: "Click on the Curriculum option in the sidebar. You'll see all available curriculum units organized by language levels. You can browse topics, view descriptions, and assign units to your lessons."
        }
      ]
    },
    {
      title: "Managing Lessons",
      icon: FileText,
      topics: [
        {
          question: "How do I schedule a lesson?",
          answer: "Go to the Lessons page, click 'Create Lesson', and select a date and time. Choose your students and curriculum unit. You can also set the lesson status (upcoming, in-progress, completed) and add notes."
        },
        {
          question: "Can I reschedule or cancel a lesson?",
          answer: "Yes, you can edit any upcoming lesson by clicking on it from the Lessons page. You can change the date, time, or cancel the lesson. Students will be notified of any changes."
        },
        {
          question: "How do I track student progress?",
          answer: "Visit the Reports page to see detailed analytics on student performance, attendance, and progress. You can filter by student, date range, or subject to get specific insights."
        }
      ]
    },
    {
      title: "Communication",
      icon: MessageSquare,
      topics: [
        {
          question: "How do I send messages to students or guardians?",
          answer: "Go to the Messages page to view all conversations. Click 'New Message' to start a conversation with a student or guardian. You can send text messages, share files, and schedule follow-ups."
        },
        {
          question: "How do I send announcements?",
          answer: "Announcements can be created from the Dashboard. Click 'Create Announcement' and select your audience (all students, specific classes, or individual students). Set the priority level and add your message."
        },
        {
          question: "Can I schedule messages?",
          answer: "Yes, when composing a message, you can set a scheduled time for it to be sent. This is useful for reminders, homework notifications, or important updates."
        }
      ]
    },
    {
      title: "Account & Settings",
      icon: HelpCircle,
      topics: [
        {
          question: "How do I update my profile information?",
          answer: "Go to Settings and click on the Profile tab. You can update your name, email, phone number, and profile picture. Changes are saved automatically."
        },
        {
          question: "How do I change my password?",
          answer: "In Settings, navigate to the Security tab. Click 'Change Password' and enter your current password followed by your new password. Make sure your new password meets the security requirements."
        },
        {
          question: "Can I customize my dashboard?",
          answer: "Yes, you can customize your dashboard view in Settings under the Appearance tab. You can adjust theme preferences, layout options, and notification settings."
        }
      ]
    }
  ];

  const quickLinks = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: Video,
      href: "#"
    },
    {
      title: "Documentation",
      description: "Browse comprehensive guides",
      icon: FileText,
      href: "#"
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: Mail,
      href: "#"
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    topics: category.topics.filter(topic => 
      topic.question.toLowerCase().includes(search.toLowerCase()) ||
      topic.answer.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.topics.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Help Center</h1>
        <p className={styles.subtitle}>Find answers to common questions and get support</p>
      </div>

      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            type="text"
            placeholder="Search for help articles, questions, or topics..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.clearSearchButton}
              onClick={() => setSearch("")}
            >
              <X className={styles.clearSearchIcon} />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.quickLinksSection}>
        <h2 className={styles.sectionTitle}>Quick Links</h2>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <Card key={index} className={styles.quickLinkCard}>
              <CardContent className={styles.quickLinkContent}>
                <link.icon className={styles.quickLinkIcon} />
                <div className={styles.quickLinkInfo}>
                  <h3 className={styles.quickLinkTitle}>{link.title}</h3>
                  <p className={styles.quickLinkDescription}>{link.description}</p>
                </div>
                <ChevronRight className={styles.quickLinkArrow} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Categories */}
      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>
          {search ? `Search Results (${filteredCategories.reduce((acc, cat) => acc + cat.topics.length, 0)} found)` : "Frequently Asked Questions"}
        </h2>
        
        {filteredCategories.length === 0 && search ? (
          <Card className={styles.noResultsCard}>
            <CardContent className={styles.noResultsContent}>
              <HelpCircle className={styles.noResultsIcon} />
              <p className={styles.noResultsText}>No results found for "{search}"</p>
              <p className={styles.noResultsSubtext}>Try different keywords or browse the categories below</p>
            </CardContent>
          </Card>
        ) : (
          <div className={styles.categoriesGrid}>
            {filteredCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className={styles.categoryCard}>
                <CardHeader className={styles.categoryHeader}>
                  <div className={styles.categoryHeaderContent}>
                    <category.icon className={styles.categoryIcon} />
                    <h3 className={styles.categoryTitle}>{category.title}</h3>
                  </div>
                </CardHeader>
                <CardContent className={styles.categoryContent}>
                  <Accordion type="single" collapsible className={styles.accordion}>
                    {category.topics.map((topic, topicIndex) => (
                      <AccordionItem 
                        key={topicIndex} 
                        value={`${categoryIndex}-${topicIndex}`}
                        className={styles.accordionItem}
                      >
                        <AccordionTrigger className={styles.accordionTrigger}>
                          {topic.question}
                        </AccordionTrigger>
                        <AccordionContent className={styles.accordionContent}>
                          <p className={styles.answerText}>{topic.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <Card className={styles.contactCard}>
        <CardContent className={styles.contactContent}>
          <div className={styles.contactInfo}>
            <h3 className={styles.contactTitle}>Still need help?</h3>
            <p className={styles.contactDescription}>
              Our support team is here to assist you. Reach out through any of these channels:
            </p>
            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <Mail className={styles.contactIcon} />
                <div>
                  <p className={styles.contactMethodLabel}>Email</p>
                  <p className={styles.contactMethodValue}>support@eslexplorers.com</p>
                </div>
              </div>
              <div className={styles.contactMethod}>
                <Phone className={styles.contactIcon} />
                <div>
                  <p className={styles.contactMethodLabel}>Phone</p>
                  <p className={styles.contactMethodValue}>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className={styles.contactMethod}>
                <Clock className={styles.contactIcon} />
                <div>
                  <p className={styles.contactMethodLabel}>Hours</p>
                  <p className={styles.contactMethodValue}>Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>
            </div>
            <Button className={styles.contactButton}>
              <MessageSquare className={styles.contactButtonIcon} />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
