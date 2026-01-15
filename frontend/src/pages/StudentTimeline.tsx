import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { useLoading } from '../components/ui/loading';

export function StudentTimeline() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const fetchMilestones = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoading(true);
      try {
        // Get user id from /auth/me
        const userRes = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const user = await userRes.json();
        const userId = user.id;
        // Fetch milestones/tasks
        const res = await fetch(`http://127.0.0.1:8000/timeline/${userId}/milestones-tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch milestones');
        const data = await res.json();
        setMilestones(data);
      } catch (e) {
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMilestones();
  }, [setLoading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-orange-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const calculateProgress = (tasks: { completed: boolean }[]) => {
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
  };

  // Use fetched milestones if available, else fallback to static
  const timelineData = milestones

  return (
    <div className="pt-8 space-y-8">
      {/* Overall progress */}
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: 'var(--foreground)' }} className="mb-1">Overall Progress</h3>
            <p className="text-sm text-gray-600">Day 15 of 90 • First 90 Days Programme</p>
          </div>
          <div className="text-right">
            <p style={{ color: 'var(--foreground)' }} className="mb-1">25%</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>
        <Progress value={25} className="h-3" />
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-8">
          {timelineData.map((milestone, index) => {
            const progress = calculateProgress(milestone.tasks);
            
            return (
              <div key={index} className="relative pl-16">
                {/* Timeline dot */}
                <div className="absolute left-3 top-6 -translate-x-1/2">
                  {getStatusIcon(milestone.status)}
                </div>

                <Card className={`p-6 ${getStatusColor(milestone.status)}`}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{milestone.week_label}</p>
                        <h3 style={{ color: 'var(--foreground)' }}>{milestone.title}</h3>
                      </div>
                      {milestone.status === 'completed' && (
                        <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                      {milestone.status === 'in-progress' && (
                        <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                      {milestone.status === 'upcoming' && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {(milestone.status === 'in-progress' || milestone.status === 'completed') && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm text-gray-900">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {milestone.tasks.map((task: any, taskIndex: number) => (
                      <div 
                        key={taskIndex} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/50"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
