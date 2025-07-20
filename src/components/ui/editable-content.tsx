import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  content: string | undefined;
  placeholder: string;
  onSave: (content: string) => Promise<void>;
  isPending?: boolean;
  addText: string;
  className?: string;
  textareaClassName?: string;
  contentClassName?: string;
  'data-testid'?: string;
};

const EditableContent = ({
  content,
  placeholder,
  onSave,
  isPending = false,
  addText,
  className = '',
  textareaClassName = '',
  contentClassName = '',
  'data-testid': testId,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const handleStartEdit = () => {
    setDraft(content || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraft('');
  };

  const handleSave = async () => {
    try {
      await onSave(draft);
      setIsEditing(false);
      setDraft('');
    } catch {
      // Error handling is done in the onSave function
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`min-h-[100px] resize-none ${textareaClassName}`}
            data-testid={`${testId}-textarea`}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              onClick={handleSave}
              disabled={isPending}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              data-testid={`${testId}-save-button`}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isPending}
              size="sm"
              className="h-8 w-8 p-0"
              data-testid={`${testId}-cancel-button`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : content ? (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEdit}
          data-testid={`${testId}-container`}
        >
          <p
            className={`text-sm text-muted-foreground leading-relaxed pl-4 ${contentClassName}`}
          >
            {content}
          </p>
        </div>
      ) : (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEdit}
          data-testid={`${testId}-add-container`}
        >
          <p
            className={`text-sm text-muted-foreground hover:text-foreground pl-4 ${contentClassName}`}
          >
            {addText}
          </p>
        </div>
      )}
    </div>
  );
};

export default EditableContent;
