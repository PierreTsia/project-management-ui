import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Users, Calendar } from 'lucide-react';

export function Projects() {
  const { t } = useTranslation();

  const projects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Modern e-commerce platform with React and Node.js',
      status: 'In Progress',
      team: 8,
      dueDate: '2024-03-15',
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      status: 'Planning',
      team: 5,
      dueDate: '2024-04-20',
    },
    {
      id: 3,
      name: 'Dashboard Analytics',
      description: 'Real-time analytics dashboard',
      status: 'Completed',
      team: 3,
      dueDate: '2024-02-28',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.projects')}</h1>
          <p className="text-muted-foreground">Manage your project portfolio</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {project.team} team members
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Due: {project.dueDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
