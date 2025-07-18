import { useParams, useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TaskDetailsContainer from '../components/tasks/TaskDetailsContainer';

const TaskDetailsPage = () => {
  const { id: projectId, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  if (!projectId || !taskId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button - Full Width */}
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </div>

      {/* Main Content */}
      <TaskDetailsContainer projectId={projectId} taskId={taskId} />
    </div>
  );
};

export default TaskDetailsPage;
