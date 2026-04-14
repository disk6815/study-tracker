"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type Subject = { id: number; name: string; color: string };
type Session = {
  id: number;
  date: string;
  duration: number;
  note: string | null;
  subject: Subject;
};

type Props = {
  sessions: Session[];
  onDelete: () => void;
  userId: number;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}時間${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

export default function History({ sessions, onDelete, userId }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("この記録を削除しますか？")) return;
    setDeletingId(id);
    await fetch(`/api/sessions/${id}?userId=${userId}`, { method: "DELETE" });
    setDeletingId(null);
    onDelete();
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">学習履歴</h2>
        <p className="text-gray-400 text-center py-8">記録がありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        学習履歴
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({sessions.length}件)
        </span>
      </h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <span
                className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: session.subject.color }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800">
                    {session.subject.name}
                  </span>
                  <span className="text-blue-600 font-mono text-sm">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(session.date), "yyyy年M月d日(E)", {
                    locale: ja,
                  })}
                </div>
                {session.note && (
                  <div className="text-sm text-gray-600 mt-1">{session.note}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(session.id)}
              disabled={deletingId === session.id}
              className="text-red-400 hover:text-red-600 text-sm transition shrink-0 ml-2"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
