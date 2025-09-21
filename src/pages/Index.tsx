import { PixiCanvas } from '@/renderer/PixiCanvas';
import { Toolbar } from '@/components/Toolbar';

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Toolbar />
      <div className="flex-1 relative">
        <PixiCanvas />
      </div>
    </div>
  );
};

export default Index;
