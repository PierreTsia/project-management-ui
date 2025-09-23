import stringToColorHex from '@/lib/color';

export const ProjectNameCell = ({ name }: { name: string }) => {
  const color = stringToColorHex(name || '');
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
};

export default ProjectNameCell;
