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
    setIsEditing(true);
    setDraft(content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraft(content || '');
  };

  const handleSave = async () => {
    await onSave(draft);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-4 ${className}`}>
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              data-testid={`${testId}-save`}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isPending}
              data-testid={`${testId}-cancel`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (content) {
    return (
      <div className={`space-y-4 ${className}`}>
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
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
        onClick={handleStartEdit}
        data-testid={`${testId}-empty`}
      >
        <p
          className={`text-sm text-muted-foreground italic pl-4 ${contentClassName}`}
        >
          {addText}
        </p>
      </div>
    </div>
  );
};

export default EditableContent;
