import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';

export function Team() {
  const { t } = useTranslations();

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Frontend Developer',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: '/avatars/john.jpg',
      projects: 3,
      tasks: 12,
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Backend Developer',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      avatar: '/avatars/jane.jpg',
      projects: 2,
      tasks: 8,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'UI/UX Designer',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      avatar: '/avatars/mike.jpg',
      projects: 4,
      tasks: 15,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.team')}</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map(member => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-16 w-16 mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  {member.email}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {member.phone}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {member.location}
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold">{member.projects}</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{member.tasks}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
