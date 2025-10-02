import React, { useEffect, useState } from 'react';
import { X, Sparkles, Users, Shield } from 'lucide-react';

interface ThresholdNotificationProps {
  userCount: number;
  theme?: 'dark' | 'light';
}

export const ThresholdNotification: React.FC<ThresholdNotificationProps> = ({
  userCount,
  theme = 'dark',
}) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'butterfly' | 'coral';
    icon: React.ReactNode;
  }>>([]);

  const [previousCount, setPreviousCount] = useState(userCount);

  useEffect(() => {
    if (userCount === previousCount) return;

    if (userCount >= 5 && previousCount < 5) {
      const id = `butterfly-${Date.now()}`;
      setNotifications(prev => [...prev, {
        id,
        message: 'The Butterfly Swarm awakens! Five souls now resonate in unity.',
        type: 'butterfly',
        icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      }]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 8000);
    }

    if (userCount >= 10 && previousCount < 10) {
      const id = `coral-${Date.now()}`;
      setNotifications(prev => [...prev, {
        id,
        message: 'The Coral Barrier emerges. A deeper threshold awaits the collective...',
        type: 'coral',
        icon: <Shield className="w-5 h-5 text-red-400" />,
      }]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 10000);
    }

    setPreviousCount(userCount);
  }, [userCount, previousCount]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-300';

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${bgColor} ${textColor} ${borderColor} border rounded-2xl shadow-2xl p-4 max-w-md backdrop-blur-xl bg-opacity-95 pointer-events-auto animate-fade-in-down`}
          style={{
            animation: 'fadeInDown 0.5s ease-out',
            boxShadow: notification.type === 'butterfly'
              ? '0 10px 40px rgba(168, 85, 247, 0.4)'
              : '0 10px 40px rgba(248, 113, 113, 0.4)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              notification.type === 'butterfly'
                ? theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                : theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              {notification.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
