import { MessageSquare, User, BookOpen, Calendar, FileText, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/student' },
  { icon: MessageSquare, label: 'Chat Assistant', path: '/student/chat' },
  { icon: BookOpen, label: 'Resources', path: '/student/resources' },
  { icon: Calendar, label: 'My Timeline', path: '/student/timeline' },
  { icon: FileText, label: 'Documents', path: '/student/documents' },
  { icon: User, label: 'Profile', path: '/student/profile' },
];

export function StudentSidebar() {
  const location = useLocation();
  const [hasNewMilestone, setHasNewMilestone] = useState(false);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [hasNewDocument, setHasNewDocument] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [hasNewResource, setHasNewResource] = useState(false);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Get User ID
        const authRes = await fetch('http://127.0.0.1:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!authRes.ok) return;
        const userData = await authRes.json();
        const graduateId = userData.id;

        // 2. Get Milestones
        const mileRes = await fetch(`http://127.0.0.1:8000/timeline/${graduateId}/milestones-tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mileRes.ok) {
          const milestones = await mileRes.json();
          const currentCount = milestones.length;
          setMilestoneCount(currentCount);

          const savedCount = parseInt(localStorage.getItem('grad_milestone_viewed_count') || '0', 10);
          if (currentCount > savedCount) {
            setHasNewMilestone(true);
          }
        }

        // 3. Get Documents & Resources (using same source)
        const docRes = await fetch('http://127.0.0.1:8000/documents/get-documents');
        if (docRes.ok) {
          const docs = await docRes.json();
          const currentDocCount = docs.length;
          setDocumentCount(currentDocCount);
          setResourceCount(currentDocCount);

          const savedDocCount = parseInt(localStorage.getItem('grad_document_viewed_count') || '0', 10);
          if (currentDocCount > savedDocCount) {
            setHasNewDocument(true);
          }

          const savedResCount = parseInt(localStorage.getItem('grad_resource_viewed_count') || '0', 10);
          if (currentDocCount > savedResCount) {
            setHasNewResource(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleLinkClick = (path: string) => {
    if (path === '/student/timeline' && hasNewMilestone) {
      setHasNewMilestone(false);
      localStorage.setItem('grad_milestone_viewed_count', milestoneCount.toString());
    }
    if (path === '/student/documents' && hasNewDocument) {
      setHasNewDocument(false);
      localStorage.setItem('grad_document_viewed_count', documentCount.toString());
    }
    if (path === '/student/resources' && hasNewResource) {
      setHasNewResource(false);
      localStorage.setItem('grad_resource_viewed_count', resourceCount.toString());
    }
  };

  return (
    <aside 
      className="fixed left-0 top-16 bottom-0 w-64 border-r z-30"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)'
      }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <img 
            src={logo} 
            alt="Datacentrix Logo" 
            className="h-8 w-auto dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          />
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            const showDot = 
              (item.path === '/student/timeline' && hasNewMilestone) ||
              (item.path === '/student/documents' && hasNewDocument) ||
              (item.path === '/student/resources' && hasNewResource);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleLinkClick(item.path)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive ? undefined : 'transparent',
                  backgroundImage: isActive ? 'linear-gradient(to right, #3b82f6, #14b8a6)' : undefined,
                  color: isActive ? 'white' : 'var(--muted-foreground)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--foreground)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--muted-foreground)';
                  }
                }}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {showDot && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[var(--background)]" />
                  )}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {showDot && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
