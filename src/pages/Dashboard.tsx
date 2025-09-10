import {
  useDashboardSummary,
  useMyProjects,
  useMyTasks,
} from '@/hooks/useDashboard';
import { useTranslations } from '@/hooks/useTranslations';
import type { DashboardProject } from '@/types/dashboard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProjectOverviewCard } from '@/components/dashboard/ProjectOverviewCard';
import { TaskCompletionChart } from '@/components/dashboard/TaskCompletionChart';
import { ProgressTrendChart } from '@/components/dashboard/ProgressTrendChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  FolderOpen,
  CheckCircle2,
  Clock,
  Circle,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: projects, isLoading: projectsLoading } = useMyProjects();
  const { data: myTasks, isLoading: tasksLoading } = useMyTasks({ limit: 5 });
  const { t } = useTranslations();

  const recentProjects = projects?.slice(0, 3) || [];
  const stats = summary;

  // Debug logging
  console.log('Dashboard Debug:', {
    stats,
    trendData,
    summaryLoading,
    projectsLoading,
    tasksLoading,
  });

  const renderRecentProjects = () => {
    if (projectsLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <ProjectOverviewCard key={i} project={{} as DashboardProject} loading />
      ));
    }

    if (recentProjects.length > 0) {
      return recentProjects.map((project: DashboardProject) => (
        <ProjectOverviewCard key={project.id} project={project} />
      ));
    }

    return (
      <div className="col-span-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('dashboard.projects.noProjects.title')}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('dashboard.projects.noProjects.description')}
            </p>
            <Button asChild>
              <Link to="/projects">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.projects.noProjects.createButton')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
        </div>
        <Button asChild>
          <Link to="/projects">
            <Plus className="h-4 w-4 mr-2" />
            {t('dashboard.newProject')}
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t('dashboard.stats.totalProjects')}
          value={stats?.totalProjects || 0}
          description={t('dashboard.stats.descriptions.totalProjects')}
          icon={<FolderOpen className="h-4 w-4" />}
          loading={summaryLoading}
        />
        <StatsCard
          title={t('dashboard.stats.activeProjects')}
          value={stats?.activeProjects || 0}
          description={t('dashboard.stats.descriptions.activeProjects')}
          icon={<Clock className="h-4 w-4" />}
          loading={summaryLoading}
        />
        <StatsCard
          title={t('dashboard.stats.totalTasks')}
          value={stats?.totalTasks || 0}
          description={t('dashboard.stats.descriptions.totalTasks')}
          icon={<CheckCircle2 className="h-4 w-4" />}
          loading={summaryLoading}
        />
        <StatsCard
          title={t('dashboard.stats.myTasks')}
          value={stats?.assignedTasks || 0}
          description={t('dashboard.stats.descriptions.myTasks')}
          icon={<Circle className="h-4 w-4" />}
          loading={summaryLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <TaskCompletionChart
          data={{
            completed: stats?.tasksByStatus?.done || 0,
            inProgress: stats?.tasksByStatus?.inProgress || 0,
            todo: stats?.tasksByStatus?.todo || 0,
          }}
          loading={summaryLoading}
        />
        <ProgressTrendChart
          data={
            trendData.length > 0
              ? trendData
              : [
                  { date: '2024-01-01', completionRate: 0, completedTasks: 0 },
                  { date: '2024-01-02', completionRate: 25, completedTasks: 5 },
                  {
                    date: '2024-01-03',
                    completionRate: 50,
                    completedTasks: 10,
                  },
                  {
                    date: '2024-01-04',
                    completionRate: 75,
                    completedTasks: 15,
                  },
                  {
                    date: '2024-01-05',
                    completionRate: 100,
                    completedTasks: 20,
                  },
                ]
          }
          loading={summaryLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects - Takes up 2/3 of the width */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t('dashboard.projects.recent')}
            </h2>
            <Button variant="outline" asChild>
              <Link to="/projects">{t('dashboard.projects.viewAll')}</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {renderRecentProjects()}
          </div>
        </div>

        {/* Right Column - Recent Tasks + Quick Actions */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t('dashboard.tasks.recent')}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('dashboard.tasks.myTasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {myTasks && myTasks.length > 0 ? (
                      <div className="space-y-3">
                        {myTasks.slice(0, 5).map(task => {
                          const getStatusIcon = () => {
                            if (task.status === 'DONE') return '✓';
                            if (task.status === 'IN_PROGRESS') return '⏳';
                            return '○';
                          };

                          return (
                            <div
                              key={task.id}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {getStatusIcon()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {task.project.name} • {task.priority}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <Button
                          variant="outline"
                          asChild
                          className="w-full mt-3"
                        >
                          <Link to="/tasks">
                            {t('dashboard.tasks.viewAll')}
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {t('dashboard.tasks.noTasks')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('dashboard.quickActions.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/projects">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {t('dashboard.quickActions.manageProjects')}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/tasks">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('dashboard.quickActions.viewTasks')}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/team">
                    <Users className="h-4 w-4 mr-2" />
                    {t('dashboard.quickActions.teamManagement')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
