import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '@/types/task';

export const Tasks = () => {
  const { t } = useTranslations();

  const [tasks] = useState<Task[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'High' ? (
      <AlertCircle className="h-4 w-4 text-red-600" />
    ) : null;
  };

  const getStatusStyle = (status: string): string => {
    if (status === 'Completed') {
      return 'bg-green-100 text-green-800';
    }
    if (status === 'In Progress') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.tasks')}</h1>
          <p className="text-muted-foreground">Track and manage your tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {getPriorityIcon(task.priority)}
                </div>
                <span className={getStatusStyle(task.status)}>
                  {task.status}
                </span>
              </div>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Assigned to: {task?.assignee?.name}</span>
                <span>Due: {task.dueDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
