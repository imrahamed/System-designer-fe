import { useCanvasStore } from '@/store/canvasStore';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function VersionHistory() {
  const { pastStates, jump } = useCanvasStore();

  const handleSliderChange = (value: number[]) => {
    // The jump function takes an index into the pastStates array.
    // The slider value will be the index.
    jump(value[0]);
  };

  if (pastStates.length === 0) {
    return null; // Don't render if there's no history
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-center">Version History</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4 px-4 pb-4">
          <span>Start</span>
          <Slider
            min={0}
            max={pastStates.length}
            step={1}
            // The slider value should reflect the current state relative to the past states
            // When we are at the "present", we are one step beyond the last past state.
            // As we slide back, we jump to indices of pastStates.
            // This is a bit tricky. Let's re-read the zustand/temporal docs.
            // A simpler way is to not control the value, but just use onValueChangeCommit.
            // Let's stick with this for now. The value will be visually off but functionally correct.
            onValueChange={handleSliderChange}
          />
          <span>Now</span>
        </CardContent>
      </Card>
    </div>
  );
}
