import { ProgressCircle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui';

interface Props {
  label: string;
  ratio: number;
  sum: string;
  total: string;
}

export default function GoalRing(props: Props) {
  const { label, ratio, sum, total } = props;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <ProgressCircle variant={resolveColor(ratio)} value={ratio} radius={24}>
              <span className="text-xs font-medium text-gray-900 cursor-default capitalize">{label.at(0)}</span>
            </ProgressCircle>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}: {ratio}% ({sum} of {total})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function resolveColor(ratio: number) {
  if (ratio > 120) return 'fuchsia';
  if (80 <= ratio && ratio <= 119) return 'success';
  if (30 <= ratio && ratio <= 79) return 'warning';
  if (1 <= ratio && ratio <= 29) return 'error';
  return 'neutral';
}
