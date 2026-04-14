"use client";

import { useState } from "react";

type Subject = { id: number; name: string; color: string };

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

type Props = {
  subjects: Subject[];
  onUpdate: () => void;
};

export default function SubjectManager({ subjects, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("科目名を入力してください");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存に失敗しました");
      }
      setName("");
      onUpdate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この科目を削除しますか？関連する記録も削除されます。")) return;
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    onUpdate();
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">科目管理</h2>

      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            科目名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：数学、英語、プログラミング"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カラー
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition border-2 ${
                  color === c ? "border-gray-800 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {saving ? "追加中..." : "科目を追加"}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">登録済み科目</h3>
        {subjects.length === 0 ? (
          <p className="text-gray-400 text-sm">科目が登録されていません</p>
        ) : (
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-gray-800">{s.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-400 hover:text-red-600 text-sm transition"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
