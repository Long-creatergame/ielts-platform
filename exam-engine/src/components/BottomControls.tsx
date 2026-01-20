import { useAttemptStore } from '../store/attemptStore';

export default function BottomControls({
  currentId,
  total = 40,
  onPrev,
  onNext,
}: {
  currentId: number;
  total?: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const toggleFlag = useAttemptStore((s) => s.actions.toggleFlag);
  const clearAnswer = useAttemptStore((s) => s.actions.clearAnswer);
  const flagged = useAttemptStore((s) => !!s.flagged[currentId]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="btn-secondary" type="button" onClick={onPrev} disabled={currentId <= 1}>
            Previous
          </button>
          <button className="btn-secondary" type="button" onClick={onNext} disabled={currentId >= total}>
            Next
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={flagged ? 'btn bg-amber-200 text-amber-900 hover:bg-amber-300' : 'btn-secondary'}
            type="button"
            onClick={() => toggleFlag(currentId)}
          >
            {flagged ? 'Flagged' : 'Flag'}
          </button>
          <button className="btn-secondary" type="button" onClick={() => clearAnswer(currentId)}>
            Clear answer
          </button>
        </div>
      </div>
    </div>
  );
}

