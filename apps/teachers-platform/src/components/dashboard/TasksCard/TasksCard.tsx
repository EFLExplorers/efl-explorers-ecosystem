import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "lucide-react";
import { Task } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, isSameDay, addDays, isAfter } from "date-fns";
import { classNames } from "@/utils/classNames";
import styles from './TasksCard.module.css';

export function TasksCard() {
  const [userId] = useState(1); // In a real app, this would come from auth context
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: [`/api/tasks/user/${userId}`]
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      await apiRequest('PATCH', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/user/${userId}`] });
    }
  });
  
  const handleTaskToggle = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, data: { completed } });
  };
  
  const getTaskDueLabel = (dueDate: Date | string | null) => {
    if (!dueDate) return "";
    
    const dueDateObj = new Date(dueDate);
    
    if (isSameDay(dueDateObj, new Date())) {
      return "Due today";
    } else if (isSameDay(dueDateObj, addDays(new Date(), 1))) {
      return "Due tomorrow";
    } else {
      const daysUntilDue = Math.ceil((dueDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `Due in ${daysUntilDue} days`;
    }
  };
  
  const getTaskDueClass = (dueDate: Date | string | null) => {
    if (!dueDate) return styles.dueDefault;
    
    const dueDateObj = new Date(dueDate);
    
    if (isAfter(new Date(), dueDateObj)) {
      return styles.dueOverdue;
    } else if (isSameDay(dueDateObj, new Date())) {
      return styles.dueOverdue;
    } else if (isSameDay(dueDateObj, addDays(new Date(), 1))) {
      return styles.dueSoon;
    } else {
      return styles.dueDefault;
    }
  };
  
  const remainingTasks = tasks?.filter(t => !t.completed).length || 0;
  
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <h2 className={styles.title}>Pending Tasks</h2>
        <span className={styles.badge}>
          {remainingTasks} remaining
        </span>
      </CardHeader>
      
      <CardContent className={styles.content}>
        {isLoading ? (
          <div className={styles.emptyState}>Loading tasks...</div>
        ) : tasks?.length === 0 ? (
          <div className={styles.emptyState}>No pending tasks</div>
        ) : (
          tasks?.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.completed ?? false} 
                onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                className={styles.checkbox}
              />
              <label 
                htmlFor={`task-${task.id}`}
                className={styles.taskLabel}
              >
                {task.title}
              </label>
              <span className={classNames(styles.dueDate, getTaskDueClass(task.dueDate))}>
                {task.dueDate && getTaskDueLabel(task.dueDate)}
              </span>
            </div>
          ))
        )}
      </CardContent>
      
      <CardFooter className={styles.footer}>
        <Button 
          variant="ghost" 
          className={styles.addButton}
        >
          <PlusIcon className={styles.addIcon} />
          Add new task
        </Button>
      </CardFooter>
    </Card>
  );
}
