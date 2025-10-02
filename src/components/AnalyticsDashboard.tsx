import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { Download, Calendar, TrendingUp, Clock, Activity } from 'lucide-react';

interface AnalyticsDashboardProps {
  userId?: string;
  theme?: 'dark' | 'light';
  onClose?: () => void;
}

const COLORS = ['#44ffdd', '#ff6b9d', '#ffd93d', '#6bcf7f', '#bd93f9', '#ff79c6'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  theme = 'dark',
  onClose,
}) => {
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const analytics = useAnalytics(userId, dateRange);
  const heatmapData = analytics.getFrequencyHeatmapData();
  const sessionStats = analytics.getSessionLengthStats();
  const frequencyStats = analytics.getFrequencyStats();

  const bgColor = theme === 'dark' ? '#1a1a2e' : '#ffffff';
  const textColor = theme === 'dark' ? '#e0e0e0' : '#1a1a2e';
  const cardBg = theme === 'dark' ? '#282a36' : '#f5f5f5';
  const borderColor = theme === 'dark' ? '#44475a' : '#d0d0d0';

  const sessionTrendData = analytics.state.sessionAnalytics.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: s.total_sessions,
    duration: Math.floor(s.total_duration_seconds / 60),
    avgFreq: Math.floor(s.avg_frequency),
  }));

  const frequencyDistributionData = Object.entries(
    analytics.state.frequencyDistribution.reduce((acc, item) => {
      acc[item.frequency_range] = (acc[item.frequency_range] || 0) + item.usage_count;
      return acc;
    }, {} as Record<string, number>)
  ).map(([range, count]) => ({ name: range, value: count }));

  const waveTypeData = analytics.state.sessionAnalytics
    .reduce((acc, s) => {
      if (s.dominant_wave_type) {
        acc[s.dominant_wave_type] = (acc[s.dominant_wave_type] || 0) + s.total_sessions;
      }
      return acc;
    }, {} as Record<string, number>);

  const waveTypeChartData = Object.entries(waveTypeData).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const exportData = () => {
    const csvData = [
      ['Date', 'Sessions', 'Duration (min)', 'Avg Frequency', 'Avg Intensity'],
      ...analytics.state.sessionAnalytics.map(s => [
        s.date,
        s.total_sessions,
        Math.floor(s.total_duration_seconds / 60),
        s.avg_frequency.toFixed(2),
        s.avg_intensity.toFixed(2),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gaa-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (analytics.state.isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: bgColor }}
      >
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: textColor }} />
          <p style={{ color: textColor }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto z-40 p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: textColor }}>
            Resonance Analytics
          </h1>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: cardBg,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: cardBg,
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" style={{ color: COLORS[0] }} />
              <span className="text-sm opacity-70" style={{ color: textColor }}>Total Sessions</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {analytics.state.sessionAnalytics.reduce((sum, s) => sum + s.total_sessions, 0)}
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: COLORS[1] }} />
              <span className="text-sm opacity-70" style={{ color: textColor }}>Avg Duration</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {Math.floor(sessionStats.avg / 60)}m
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: COLORS[2] }} />
              <span className="text-sm opacity-70" style={{ color: textColor }}>Avg Frequency</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {Math.floor(frequencyStats.avg)}Hz
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5" style={{ color: COLORS[3] }} />
              <span className="text-sm opacity-70" style={{ color: textColor }}>Most Used</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {Math.floor(frequencyStats.mostUsed)}Hz
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
              Session Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis dataKey="date" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip
                  contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                  labelStyle={{ color: textColor }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  name="Duration (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
              Frequency Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={frequencyDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {frequencyDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
              Average Frequency Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis dataKey="date" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip
                  contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                  labelStyle={{ color: textColor }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgFreq"
                  stroke={COLORS[4]}
                  strokeWidth={2}
                  name="Avg Frequency (Hz)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {waveTypeChartData.length > 0 && (
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
                Wave Type Usage
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waveTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                  <XAxis dataKey="name" stroke={textColor} />
                  <YAxis stroke={textColor} />
                  <Tooltip
                    contentStyle={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
                    labelStyle={{ color: textColor }}
                  />
                  <Bar dataKey="value" fill={COLORS[5]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
            Usage Heatmap (Hour of Day vs Day of Week)
          </h2>
          <div className="overflow-x-auto">
            <div className="inline-grid" style={{ gridTemplateColumns: `40px repeat(24, 30px)` }}>
              <div></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="text-xs text-center"
                  style={{ color: textColor, opacity: 0.7 }}
                >
                  {i}
                </div>
              ))}
              {heatmapData.map((row, dayIndex) => (
                <React.Fragment key={dayIndex}>
                  <div
                    className="text-xs flex items-center"
                    style={{ color: textColor, opacity: 0.7 }}
                  >
                    {dayLabels[dayIndex]}
                  </div>
                  {row.map((value, hourIndex) => {
                    const maxValue = Math.max(...heatmapData.flat());
                    const intensity = maxValue > 0 ? value / maxValue : 0;
                    return (
                      <div
                        key={hourIndex}
                        className="w-[30px] h-[30px] rounded"
                        style={{
                          backgroundColor: intensity > 0
                            ? `rgba(68, 255, 221, ${intensity})`
                            : theme === 'dark' ? '#1a1a2e' : '#f0f0f0',
                        }}
                        title={`${dayLabels[dayIndex]} ${hourIndex}:00 - ${value} sessions`}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
