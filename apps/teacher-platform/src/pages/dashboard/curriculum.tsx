'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Search, 
  FileText,
  Clock,
  UserPlus,
  Check
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Curriculum } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './curriculum.module.css';

export default function CurriculumPage() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("Level 1 - Pre A1");
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  
  const { data: curriculum, isLoading } = useQuery<Curriculum[]>({
    queryKey: ["/api/curriculum"]
  });
  
  // Mock data for the UI structure
  const mockLevels = [
    "Level 1 - Pre A1",
    "Level 2 - Pre A1",
    "L0 - Pre A1",
    "L1 Pre A1",
    "L2 Pre A1",
    "L3 A1",
    "L4 A1",
    "L5 A1"
  ];
  
  // ELS curriculum units by language skills for Pre A1 level
  const unitTopics = [
    { 
      title: "Basic Greetings and Introductions", 
      description: "Simple greetings, introductions, and basic social expressions for complete beginners"
    },
    { 
      title: "Alphabet and Pronunciation", 
      description: "Learning the alphabet, letter recognition, and basic sound patterns"
    },
    { 
      title: "Numbers and Counting", 
      description: "Cardinal numbers 1-20, asking about quantities, and basic counting skills"
    },
    { 
      title: "Personal Information", 
      description: "Sharing basic personal details, countries, nationalities and simple forms"
    },
    { 
      title: "Family and Friends", 
      description: "Describing immediate family members, possessives, and simple relationships"
    },
    { 
      title: "Colors and Classroom Objects", 
      description: "Basic vocabulary for colors, classroom items, and simple descriptive phrases"
    },
    { 
      title: "Daily Routines", 
      description: "Simple present tense verbs for everyday activities and basic time expressions"
    },
    { 
      title: "Food and Drink", 
      description: "Basic food vocabulary, expressing likes/dislikes, and ordering in simple situations"
    },
    { 
      title: "Places Around Town", 
      description: "Locations, prepositions of place, and asking for/giving basic directions"
    },
    { 
      title: "Simple Conversation", 
      description: "Basic question forms, conversation strategies, and simple responses"
    }
  ];
  
  // Generate lesson status randomly
  const getRandomStatus = () => {
    const statuses = ["published", "draft"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };
  
  // Generate random duration between 30-60 minutes
  const getRandomDuration = () => {
    return `${Math.floor(Math.random() * 31) + 30} min`;
  };
  
  // Generate random number of materials (1-5)
  const getRandomMaterials = () => {
    return Math.floor(Math.random() * 5) + 1;
  };
  
  // Generate lessons for each unit
  const getLessonsForUnit = (unitIndex: number, unitTopic: any) => {
    const lessonTypes = [
      { type: "Vocabulary", focus: "Introduction and practice of new vocabulary." },
      { type: "Grammar", focus: "Basic grammatical structures and patterns." },
      { type: "Reading", focus: "Simple reading comprehension with visual support." },
      { type: "Listening", focus: "Audio comprehension with guided activities." },
      { type: "Speaking", focus: "Controlled speaking practice and dialogues." },
      { type: "Writing", focus: "Simple guided writing tasks." },
      { type: "Pronunciation", focus: "Sound recognition and production practice." },
      { type: "Integrated Skills", focus: "Combining multiple language skills." },
      { type: "Review", focus: "Consolidation of previously learned material." },
      { type: "Assessment", focus: "Simple evaluation activities." }
    ];
    
    return lessonTypes.map((lessonType, lessonIndex) => ({
      id: lessonIndex + 1,
      title: `Lesson ${lessonIndex + 1}: ${lessonType.type} - ${unitTopic.title}`,
      focus: lessonType.focus,
      duration: getRandomDuration(),
      materials: getRandomMaterials(),
      status: getRandomStatus()
    }));
  };
  
  // Generate 10 units with 10 lessons each
  const mockUnits = unitTopics.map((topic, unitIndex) => {
    return {
      id: unitIndex + 1,
      title: `Unit ${unitIndex + 1}: ${topic.title}`,
      description: topic.description + ` for Level 1 - Pre A1 students`,
      lessons: getLessonsForUnit(unitIndex, topic)
    };
  });
  
  const getLessonStatusBadge = (status: string) => {
    if (status === "published") {
      return <Badge className={styles.badgeGreen}>Published</Badge>;
    }
    return <Badge className={styles.badgeBlue}>Draft</Badge>;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Curriculum</h1>
          <p className={styles.subtitle}>Browse and assign lessons to your students</p>
        </div>
        <div className={styles.headerActions}>
          {selectedLessons.size > 0 && (
            <Button className={styles.assignButton}>
              <UserPlus className={styles.actionIcon} />
              Assign Selected ({selectedLessons.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search curriculum..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className={styles.levelsSection}>
        <div className={styles.levelsBorder}>
          <ul className={styles.levelsList}>
            {mockLevels.map((level) => (
              <li key={level}>
                <Button 
                  variant="ghost" 
                  className={classNames(
                    styles.levelButton,
                    activeLevel === level && styles.levelButtonActive
                  )}
                  onClick={() => setActiveLevel(level)}
                >
                  {level}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Level header */}
      <div className={styles.levelHeader}>
        <div className={styles.levelHeaderTop}>
          <h2 className={styles.levelTitle}>{activeLevel}</h2>
        </div>
        <p className={styles.levelDescription}>Browse available lessons and assign them to your students</p>
      </div>
      
      {/* Units and lessons */}
      <div className={styles.unitsContainer}>
        {mockUnits.map((unit) => (
          <Accordion type="single" collapsible key={unit.id} className={styles.accordion}>
            <AccordionItem value={`unit-${unit.id}`} className={styles.accordionItem}>
              <div className={styles.unitHeader}>
                <AccordionTrigger className={styles.accordionTrigger}>
                  <div className={styles.unitTitle}>{unit.title}</div>
                </AccordionTrigger>
              </div>
              <AccordionContent className={styles.accordionContent}>
                <p className={styles.unitDescription}>{unit.description}</p>
                
                <div className={styles.lessonsList}>
                  {unit.lessons.map((lesson) => {
                    const lessonKey = `${unit.id}-${lesson.id}`;
                    const isSelected = selectedLessons.has(lessonKey);
                    return (
                      <div 
                        key={lesson.id} 
                        className={classNames(
                          styles.lessonCard,
                          isSelected && styles.lessonCardSelected
                        )}
                        onClick={() => {
                          const newSelected = new Set(selectedLessons);
                          if (isSelected) {
                            newSelected.delete(lessonKey);
                          } else {
                            newSelected.add(lessonKey);
                          }
                          setSelectedLessons(newSelected);
                        }}
                      >
                        <div className={styles.lessonCardContent}>
                          <div className={styles.lessonInfo}>
                            <button
                              type="button"
                              className={styles.selectButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newSelected = new Set(selectedLessons);
                                if (isSelected) {
                                  newSelected.delete(lessonKey);
                                } else {
                                  newSelected.add(lessonKey);
                                }
                                setSelectedLessons(newSelected);
                              }}
                            >
                              {isSelected ? (
                                <div className={styles.checkboxSelected}>
                                  <Check className={styles.checkIcon} />
                                </div>
                              ) : (
                                <div className={styles.checkbox} />
                              )}
                            </button>
                            <FileText className={styles.lessonIcon} />
                            <div>
                              <p className={styles.lessonTitle}>{lesson.title}</p>
                              <p className={styles.lessonFocus}>{lesson.focus}</p>
                              <div className={styles.lessonMeta}>
                                <div className={styles.lessonMetaItem}>
                                  <Clock className={styles.metaIcon} />
                                  <span>{lesson.duration}</span>
                                </div>
                                <div className={styles.lessonMetaItem}>
                                  <FileText className={styles.metaIcon} />
                                  <span>{lesson.materials} materials</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.lessonActions}>
                            {getLessonStatusBadge(lesson.status)}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={styles.lessonAssignButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle individual lesson assignment
                              }}
                            >
                              <UserPlus className={styles.assignIcon} />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
