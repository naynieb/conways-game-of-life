import { GameBoard } from './GameBoard';
import { ErrorBoundary } from './ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center">
        <GameBoard />
      </div>
    </ErrorBoundary>
  );
}
