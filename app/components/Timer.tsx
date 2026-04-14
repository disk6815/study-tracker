"use client";

import { useState, useEffect, useRef } from "react";

type Subject = { id: number; name: string; color: string };

type Props = {
  subjects: Subject[];
  onSave: () => void;
  userId: number;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function Timer({ subjects, onSave, userId }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStart = () => {
    if (!selectedSubjectId) {
      setError("科目を選択してください");
      return;
    }
    setError("");
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const handleSave = async () => {
    if (!selectedSubjectId || elapsed === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          date: new Date().toISOString(),
          duration: elapsed,
          note: note || null,
          userId,
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setElapsed(0);
      setNote("");
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">タイマー</h2>

      <div className="text-center">
        <span className="text-6xl font-mono font-bold text-blue-600 tabular-nums">
          {formatTime(elapsed)}
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          科目
        </label>
        <select
          value={selectedSubjectId}
          onChange={(e) =>
            setSelectedSubjectId(e.target.value ? Number(e.target.value) : "")
          }
          disabled={running}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">選択してください</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ（任意）
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="学習内容など"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        {!running ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            開始
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition"
          >
            停止
          </button>
        )}
        <button
          onClick={handleReset}
          disabled={running}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          リセット
        </button>
      </div>

      {!running && elapsed > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "記録を保存"}
        </button>
      )}
    </div>
  );
}
