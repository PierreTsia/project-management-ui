import { useProjects } from '@/hooks/useProjects';
import { useAllProjectsProgress } from '@/hooks/useReporting';
import { useTeamPerformance } from '@/hooks/useReporting';
import { useTranslations } from '@/hooks/useTranslations';
import { useUser } from '@/hooks/useUser';
import type { Project } from '@/types/project';
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
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: user } = useUser();
  const { data: progressData, isLoading: progressLoading } =
    useAllProjectsProgress(user?.id);
  const { data: teamPerformance, isLoading: teamLoading } =
    useTeamPerformance();
  const { t } = useTranslations();

  const recentProjects = projects?.projects?.slice(0, 3) || [];
  const stats = progressData?.aggregatedStats;
  const trendData = progressData?.trendData || [];

  const renderRecentProjects = () => {
    if (projectsLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <ProjectOverviewCard key={i} project={{} as Project} loading />
      ));
    }

    if (recentProjects.length > 0) {
      return recentProjects.map((project: Project) => (
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
          loading={progressLoading}
        />
        <StatsCard
          title={t('dashboard.stats.activeProjects')}
          value={stats?.activeProjects || 0}
          description={t('dashboard.stats.descriptions.activeProjects')}
          icon={<Clock className="h-4 w-4" />}
          loading={progressLoading}
        />
        <StatsCard
          title={t('dashboard.stats.totalTasks')}
          value={stats?.totalTasks || 0}
          description={t('dashboard.stats.descriptions.totalTasks')}
          icon={<CheckCircle2 className="h-4 w-4" />}
          loading={progressLoading}
        />
        <StatsCard
          title={t('dashboard.stats.myTasks')}
          value={stats?.myTasks || 0}
          description={t('dashboard.stats.descriptions.myTasks')}
          icon={<Circle className="h-4 w-4" />}
          loading={progressLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <TaskCompletionChart
          data={{
            completed: stats?.completedTasks || 0,
            inProgress: stats?.inProgressTasks || 0,
            todo: stats?.todoTasks || 0,
          }}
          loading={progressLoading}
        />
        <ProgressTrendChart data={trendData} loading={progressLoading} />
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

        {/* Right Column - Team Performance + Quick Actions */}
        <div className="space-y-6">
          {/* Team Performance */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t('dashboard.team.performance')}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('dashboard.team.topPerformers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
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
                  <div className="space-y-4">
                    {teamPerformance?.topPerformers.map((performer, index) => (
                      <div
                        key={performer.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {performer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {performer.tasksCompleted} tasks •{' '}
                            {performer.completionRate}% completion
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Velocity */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('dashboard.team.velocity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      {teamPerformance?.teamVelocity.current}{' '}
                      {t('dashboard.team.tasksPerWeek')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {teamPerformance?.teamVelocity.trend === 'up' ? '+' : ''}
                      {(teamPerformance?.teamVelocity.current || 0) -
                        (teamPerformance?.teamVelocity.previous || 0)}{' '}
                      {t('dashboard.team.fromLastWeek')}
                    </div>
                  </div>
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
