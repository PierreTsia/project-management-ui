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
import { TaskPriorityChart } from '@/components/dashboard/TaskPriorityChart';
import { MyTaskList } from '@/components/dashboard/MyTaskList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const RecentProjects = () => {
    if (projectsLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <ProjectOverviewCard
          key={i}
          project={{} as DashboardProject}
          loading
          testId={`recent-project-skeleton-${i}`}
        />
      ));
    }

    if (recentProjects.length > 0) {
      return recentProjects.map((project: DashboardProject) => (
        <ProjectOverviewCard
          key={project.id}
          project={project}
          testId={`recent-project-card-${project.id}`}
        />
      ));
    }

    return (
      <div className="col-span-2" data-testid="recent-projects-empty">
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
    <div className="space-y-6" data-testid="dashboard-root">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-testid="dashboard-header"
      >
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
      <div
        className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
        data-testid="dashboard-stats"
      >
        <StatsCard
          testId="stats-total-projects"
          title={t('dashboard.stats.totalProjects')}
          value={stats?.totalProjects || 0}
          description={t('dashboard.stats.descriptions.totalProjects')}
          icon={<FolderOpen className="h-5 w-5 md:h-6 md:w-6" />}
          iconColor="text-blue-500"
          loading={summaryLoading}
          href="/projects"
        />
        <StatsCard
          testId="stats-active-projects"
          title={t('dashboard.stats.activeProjects')}
          value={stats?.activeProjects || 0}
          description={t('dashboard.stats.descriptions.activeProjects')}
          icon={<Clock className="h-5 w-5 md:h-6 md:w-6" />}
          iconColor="text-orange-500"
          loading={summaryLoading}
          href="/projects?status=ACTIVE"
        />
        <StatsCard
          testId="stats-total-tasks"
          title={t('dashboard.stats.totalTasks')}
          value={stats?.totalTasks || 0}
          description={t('dashboard.stats.descriptions.totalTasks')}
          icon={<CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />}
          iconColor="text-green-500"
          loading={summaryLoading}
        />
        <StatsCard
          testId="stats-my-tasks"
          title={t('dashboard.stats.myTasks')}
          value={stats?.assignedTasks || 0}
          description={t('dashboard.stats.descriptions.myTasks')}
          icon={<Circle className="h-5 w-5 md:h-6 md:w-6" />}
          iconColor="text-purple-500"
          loading={summaryLoading}
        />
      </div>

      {/* Charts Row */}
      <div
        className="grid gap-6 md:grid-cols-2"
        data-testid="dashboard-charts-row"
      >
        <TaskCompletionChart
          testId="chart-completion"
          data={{
            completed: stats?.tasksByStatus?.done || 0,
            inProgress: stats?.tasksByStatus?.inProgress || 0,
            todo: stats?.tasksByStatus?.todo || 0,
          }}
          loading={summaryLoading}
        />
        <TaskPriorityChart
          testId="chart-priority"
          data={{
            high: stats?.tasksByPriority?.high || 0,
            medium: stats?.tasksByPriority?.medium || 0,
            low: stats?.tasksByPriority?.low || 0,
          }}
          loading={summaryLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div
        className="grid gap-6 lg:grid-cols-3"
        data-testid="dashboard-main-grid"
      >
        {/* Recent Projects - Takes up 2/3 of the width */}
        <div className="lg:col-span-2" data-testid="dashboard-recent-projects">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t('dashboard.projects.recent')}
            </h2>
            <Button variant="outline" asChild>
              <Link to="/projects" data-testid="recent-projects-view-all">
                {t('dashboard.projects.viewAll')}
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RecentProjects />
          </div>
        </div>

        {/* Right Column - Recent Tasks + Quick Actions */}
        <div className="space-y-6" data-testid="dashboard-right-col">
          {/* Recent Tasks */}
          <div data-testid="dashboard-recent-tasks">
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
                <MyTaskList tasks={myTasks} loading={tasksLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card data-testid="dashboard-quick-actions">
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
                  <Link to="/projects" data-testid="quickaction-projects">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {t('dashboard.quickActions.manageProjects')}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/tasks" data-testid="quickaction-tasks">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('dashboard.quickActions.viewTasks')}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to="/team" data-testid="quickaction-team">
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
