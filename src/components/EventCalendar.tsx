import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SyncEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  created_by: string;
  max_participants: number | null;
  intention_focus: string | null;
  participant_count?: number;
  is_joined?: boolean;
}

interface EventCalendarProps {
  userId?: string;
  theme?: 'dark' | 'light';
  onCreateEvent?: () => void;
}

export const EventCalendar = ({ userId, theme = 'dark', onCreateEvent }: EventCalendarProps) => {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { data: eventsData, error: eventsError } = await supabase
        .from('collective_sync_events')
        .select('*')
        .eq('is_active', true)
        .gte('start_time', oneDayAgo.toISOString())
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      if (eventsData) {
        const eventsWithParticipants = await Promise.all(
          eventsData.map(async (event) => {
            const { count } = await supabase
              .from('event_participants')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

            let isJoined = false;
            if (userId) {
              const { data: participantData } = await supabase
                .from('event_participants')
                .select('id')
                .eq('event_id', event.id)
                .eq('user_id', userId)
                .maybeSingle();

              isJoined = !!participantData;
            }

            return {
              ...event,
              participant_count: count || 0,
              is_joined: isJoined,
            };
          })
        );

        setEvents(eventsWithParticipants);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!userId) {
      alert('Please provide a user ID to join events');
      return;
    }

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId });

      if (error) {
        if (error.code === '23505') {
          alert('You have already joined this event');
        } else {
          throw error;
        }
      } else {
        loadEvents();
      }
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event');
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      loadEvents();
    } catch (error) {
      console.error('Failed to leave event:', error);
      alert('Failed to leave event');
    }
  };

  const formatUTCTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toUTCString();
  };

  const formatLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getTimeUntilEvent = (startTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const diff = start - now;

    if (diff < 0) {
      const elapsed = Math.abs(diff);
      if (elapsed < 60 * 60 * 1000) {
        return 'Happening now';
      }
      return 'Past event';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    }
    return `In ${minutes}m`;
  };

  const isEventLive = (startTime: string, duration: number) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = start + duration * 60 * 1000;
    return now >= start && now <= end;
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 bg-opacity-90 text-white' : 'bg-white bg-opacity-90 text-gray-900'} backdrop-blur-sm rounded-2xl shadow-2xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">Global Sync Events</h2>
        </div>
        {onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        )}
      </div>

      <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Clock className="w-4 h-4 text-cyan-400" />
        <div className="flex-1">
          <div className="text-xs text-gray-400">Current UTC Time</div>
          <div className="text-sm font-mono font-semibold">
            {currentTime.toUTCString()}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming events scheduled</p>
          {onCreateEvent && (
            <button
              onClick={onCreateEvent}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Create the first event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => {
            const isLive = isEventLive(event.start_time, event.duration_minutes);
            const timeUntil = getTimeUntilEvent(event.start_time);

            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border ${
                  isLive
                    ? 'border-green-500 bg-green-500/10'
                    : theme === 'dark'
                    ? 'border-gray-700 bg-gray-800/50'
                    : 'border-gray-300 bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                      {event.title}
                      {isLive && (
                        <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full animate-pulse">
                          LIVE
                        </span>
                      )}
                    </h3>
                    {event.description && (
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    timeUntil === 'Happening now'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {timeUntil}
                  </span>
                </div>

                {event.intention_focus && (
                  <div className={`text-xs mb-2 px-2 py-1 rounded inline-block ${theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                    Intention: {event.intention_focus}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-mono">{formatLocalTime(event.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{event.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {event.participant_count}
                      {event.max_participants ? `/${event.max_participants}` : ''}
                    </span>
                  </div>
                </div>

                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  UTC: {formatUTCTime(event.start_time)}
                </div>

                {userId && (
                  <button
                    onClick={() => event.is_joined ? leaveEvent(event.id) : joinEvent(event.id)}
                    disabled={!event.is_joined && event.max_participants !== null && event.participant_count >= event.max_participants}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      event.is_joined
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : event.max_participants !== null && event.participant_count >= event.max_participants
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {event.is_joined ? 'Leave Event' : event.max_participants !== null && event.participant_count >= event.max_participants ? 'Event Full' : 'Join Event'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
