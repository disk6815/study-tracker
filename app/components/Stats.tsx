"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts/types/component/Tooltip";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

type Subject = { id: number; name: string; color: string };
type Session = {
  id: number;
  date: string;
  duration: number;
  subject: Subject;
};

type Props = {
  sessions: Session[];
};

function formatHours(seconds: number): string {
  const h = seconds / 3600;
  return h >= 1 ? `${h.toFixed(1)}h` : `${Math.floor(seconds / 60)}m`;
}

export default function Stats({ sessions }: Props) {
  const now = new Date();

  // 今週の日別データ
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const total = sessions
      .filter((s) => format(new Date(s.date), "yyyy-MM-dd") === dayStr)
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      name: format(day, "E", { locale: ja }),
      seconds: total,
      hours: parseFloat((total / 3600).toFixed(2)),
    };
  });

  // 今月の日別データ
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthlyData = monthDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const total = sessions
      .filter((s) => format(new Date(s.date), "yyyy-MM-dd") === dayStr)
      .reduce((sum, s) => sum + s.duration, 0);
    return {
      name: format(day, "d"),
      seconds: total,
      hours: parseFloat((total / 3600).toFixed(2)),
    };
  });

  // 科目別合計
  const subjectMap = new Map<number, { name: string; color: string; seconds: number }>();
  sessions.forEach((s) => {
    const existing = subjectMap.get(s.subject.id);
    if (existing) {
      existing.seconds += s.duration;
    } else {
      subjectMap.set(s.subject.id, {
        name: s.subject.name,
        color: s.subject.color,
        seconds: s.duration,
      });
    }
  });
  const subjectData = Array.from(subjectMap.values()).map((s) => ({
    name: s.name,
    color: s.color,
    hours: parseFloat((s.seconds / 3600).toFixed(2)),
    seconds: s.seconds,
  }));

  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const weekSeconds = weeklyData.reduce((sum, d) => sum + d.seconds, 0);
  const monthSeconds = monthlyData.reduce((sum, d) => sum + d.seconds, 0);

  const customTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const seconds = (payload[0].payload as { seconds: number }).seconds;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return (
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow">
          {h > 0 ? `${h}時間${m}分` : `${m}分`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">今週の合計</p>
          <p className="text-2xl font-bold text-blue-600">{formatHours(weekSeconds)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">今月の合計</p>
          <p className="text-2xl font-bold text-green-600">{formatHours(monthSeconds)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">累計</p>
          <p className="text-2xl font-bold text-purple-600">{formatHours(totalSeconds)}</p>
        </div>
      </div>

      {/* 今週の棒グラフ */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">今週の学習時間</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) => `${v}h`}
              tick={{ fontSize: 12 }}
              width={32}
            />
            <Tooltip content={customTooltip} />
            <Bar dataKey="hours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 今月の棒グラフ */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {format(now, "yyyy年M月", { locale: ja })}の学習時間
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={2} />
            <YAxis
              tickFormatter={(v) => `${v}h`}
              tick={{ fontSize: 12 }}
              width={32}
            />
            <Tooltip content={customTooltip} />
            <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 科目別円グラフ */}
      {subjectData.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">科目別学習時間</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subjectData}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {subjectData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)}h`, "学習時間"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
