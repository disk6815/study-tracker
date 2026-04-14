"use client";

import { useState } from "react";

type User = { id: number; name: string };

type Props = {
  onLogin: (user: User) => void;
};

export default function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!password.trim()) {
      setError("パスワードを入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      onLogin(data);
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          学習記録
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          名前とパスワードを入力してください
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：田中"
              autoFocus
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "確認中..." : "はじめる"}
          </button>
        </form>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">はじめての方</p>
          <p>名前とパスワードを入力すると自動で登録されます。</p>
          <p className="font-medium text-gray-600 mt-2">2回目以降</p>
          <p>同じ名前＋パスワードで前回の記録が表示されます。</p>
        </div>
      </div>
    </div>
  );
}
