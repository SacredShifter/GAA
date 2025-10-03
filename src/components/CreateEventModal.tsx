import { useState } from 'react';
import { X, Calendar, Clock, Users, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  theme?: 'dark' | 'light';
  onEventCreated?: () => void;
}

export const CreateEventModal = ({
  isOpen,
  onClose,
  userId,
  theme = 'dark',
  onEventCreated,
}: CreateEventModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [intentionFocus, setIntentionFocus] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);

      const startTime = new Date(`${date}T${time}:00Z`);

      const { error } = await supabase.from('collective_sync_events').insert({
        title: title.trim(),
        description: description.trim(),
        start_time: startTime.toISOString(),
        duration_minutes: duration,
        created_by: userId,
        max_participants: maxParticipants || null,
        intention_focus: intentionFocus.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setDuration(30);
      setMaxParticipants('');
      setIntentionFocus('');

      onEventCreated?.();
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        } rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Create Sync Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Global Meditation Session"
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Join us for a collective consciousness synchronization session..."
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Date (UTC) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={getMinDate()}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Time (UTC) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Duration (minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Participants</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Unlimited"
                  min={1}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Intention Focus</label>
            <div className="relative">
              <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={intentionFocus}
                onChange={(e) => setIntentionFocus(e.target.value)}
                placeholder="Peace, Healing, Unity, etc."
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Optional: Set a collective intention for the session
            </p>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>Note:</strong> All times are in UTC to ensure global coordination. Your local time will be displayed in the calendar.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !title.trim() || !date || !time}
              className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {creating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
