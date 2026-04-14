"use client";

import { useState, useEffect, useCallback } from "react";
import Timer from "./components/Timer";
import ManualEntry from "./components/ManualEntry";
import History from "./components/History";
import Stats from "./components/Stats";
import SubjectManager from "./components/SubjectManager";
import LoginScreen from "./components/LoginScreen";

type User = { id: number; name: string };
type Subject = { id: number; name: string; color: string };
type Session = {
  id: number;
  date: string;
  duration: number;
  note: string | null;
  subject: Subject;
};

type Tab = "timer" | "manual" | "history" | "stats" | "subjects";

const TABS: { id: Tab; label: string }[] = [
  { id: "timer", label: "タイマー" },
  { id: "manual", label: "手動入力" },
  { id: "history", label: "履歴" },
  { id: "stats", label: "統計" },
  { id: "subjects", label: "科目管理" },
];

const USER_STORAGE_KEY = "study_tracker_user";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("timer");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  // ローカルストレージからユーザーを復元
  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  const fetchSubjects = useCallback(async (userId: number) => {
    const res = await fetch(`/api/subjects?userId=${userId}`);
    const data = await res.json();
    setSubjects(data);
  }, []);

  const fetchSessions = useCallback(async (userId: number) => {
    const res = await fetch(`/api/sessions?userId=${userId}`);
    const data = await res.json();
    setSessions(data);
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubjects(user.id);
      fetchSessions(user.id);
    }
  }, [user, fetchSubjects, fetchSessions]);

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setSubjects([]);
    setSessions([]);
    setTab("timer");
  };

  const handleDataUpdate = () => {
    if (user) fetchSessions(user.id);
  };

  const handleSubjectUpdate = () => {
    if (user) fetchSubjects(user.id);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">学習記録</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">{user.name}</span> さん
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1 transition"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* タブナビゲーション */}
        <div className="flex gap-1 bg-white rounded-xl shadow p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        {tab === "timer" && (
          <Timer subjects={subjects} onSave={handleDataUpdate} userId={user.id} />
        )}
        {tab === "manual" && (
          <ManualEntry subjects={subjects} onSave={handleDataUpdate} userId={user.id} />
        )}
        {tab === "history" && (
          <History sessions={sessions} onDelete={handleDataUpdate} userId={user.id} />
        )}
        {tab === "stats" && <Stats sessions={sessions} />}
        {tab === "subjects" && (
          <SubjectManager subjects={subjects} onUpdate={handleSubjectUpdate} userId={user.id} />
        )}
      </div>
    </div>
  );
}
