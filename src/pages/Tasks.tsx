import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

export function Tasks() {
  const { t } = useTranslation();

  const tasks = [
    {
      id: 1,
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the new feature',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-03-10',
    },
    {
      id: 2,
      title: 'Implement authentication',
      description: 'Set up JWT authentication system',
      status: 'Completed',
      priority: 'High',
      assignee: 'Jane Smith',
      dueDate: '2024-03-05',
    },
    {
      id: 3,
      title: 'Write documentation',
      description: 'Create API documentation and user guides',
      status: 'Todo',
      priority: 'Medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-03-15',
    },
  ];

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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Assigned to: {task.assignee}</span>
                <span>Due: {task.dueDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
