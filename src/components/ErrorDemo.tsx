import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Bug } from 'lucide-react';

// Component that throws an error after 3 clicks
const BuggyComponent = () => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      throw new Error('This is a test error to demonstrate the ErrorBoundary!');
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} variant="destructive">
        <Bug className="mr-2 h-4 w-4" />
        Click to Trigger Error ({clickCount}/3)
      </Button>
      <p className="text-xs text-muted-foreground">
        Click 3 times to trigger the error boundary
      </p>
    </div>
  );
};

export const ErrorDemo = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>Error Boundary Demo</CardTitle>
        </div>
        <CardDescription>
          Test the error boundary by triggering different types of errors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Test Error Boundary</h4>
          <p className="text-sm text-muted-foreground">
            Click the button below 3 times to trigger an error and see how the
            ErrorBoundary handles it.
          </p>
        </div>

        <BuggyComponent />

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Features Demonstrated:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Error catching and display</li>
            <li>• Retry functionality</li>
            <li>• Navigation to home</li>
            <li>• Development error details</li>
            <li>• Internationalized error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
