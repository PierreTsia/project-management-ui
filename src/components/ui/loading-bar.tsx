type LoadingBarProps = {
  className?: string;
};

export const LoadingBar = ({ className }: LoadingBarProps) => (
  <div
    className={`pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden ${className || ''}`}
  >
    <div className="h-full w-full bg-primary/30" />
    <div
      className="h-full w-full"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(0,0,0,0) 0%, hsl(var(--primary)) 40%, hsl(var(--primary)) 60%, rgba(0,0,0,0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'loadingIndeterminate 1.1s ease-out infinite',
        filter: 'drop-shadow(0 0 2px hsl(var(--primary)))',
      }}
    />
    <style>
      {`@keyframes loadingIndeterminate {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`}
    </style>
  </div>
);

export default LoadingBar;
