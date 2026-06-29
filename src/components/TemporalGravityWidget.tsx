import { useEffect, useState } from 'react';
import { TemporalGravityVisualizer, PhysicsTask } from './TemporalGravityVisualizer';
import { useAuth } from '@/context/AuthContext';

export const TemporalGravityWidget = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PhysicsTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/v1/visualizer/physics-frame?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.nodes) {
          setTasks(data.data.nodes);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="w-full h-full min-h-[300px] flex items-center justify-center font-mono text-[10px] sm:text-xs uppercase text-gray-500 p-4 text-center bg-slate-950 rounded-xl">Loading Physics Engine...</div>;

  if (tasks.length === 0) return <div className="w-full h-full min-h-[300px] flex items-center justify-center font-mono text-[10px] sm:text-xs uppercase text-gray-500 p-4 text-center bg-slate-950 rounded-xl">No active tasks pulling gravity.</div>;

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden relative rounded-xl shadow-sm bg-slate-950">
      <TemporalGravityVisualizer tasksData={tasks} />
    </div>
  );
}
