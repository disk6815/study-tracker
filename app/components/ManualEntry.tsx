"use client";

import { useState } from "react";
import { format } from "date-fns";

type Subject = { id: number; name: string; color: string };

type Props = {
  subjects: Subject[];
  onSave: () => void;
};

export default function ManualEntry({ subjects, onSave }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!subjectId) {
      setError("科目を選択してください");
      return;
    }
    const totalSeconds =
      parseInt(hours || "0") * 3600 + parseInt(minutes || "0") * 60;
    if (totalSeconds <= 0) {
      setError("学習時間を入力してください");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          date: new Date(date).toISOString(),
          duration: totalSeconds,
          note: note || null,
        }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setSuccess(true);
      setNote("");
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">手動入力</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            科目
          </label>
          <select
            value={subjectId}
            onChange={(e) =>
              setSubjectId(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学習時間
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">時間</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">分</span>
          </div>
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
        {success && <p className="text-green-600 text-sm">記録を保存しました！</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {saving ? "保存中..." : "記録を保存"}
        </button>
      </form>
    </div>
  );
}
