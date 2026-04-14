"use client";

import { useState, useEffect, useCallback } from "react";
import Timer from "./components/Timer";
import ManualEntry from "./components/ManualEntry";
import History from "./components/History";
import Stats from "./components/Stats";
import SubjectManager from "./components/SubjectManager";

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

export default function Home() {
  const [tab, setTab] = useState<Tab>("timer");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const fetchSubjects = useCallback(async () => {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    setSubjects(data);
  }, []);

  const fetchSessions = useCallback(async () => {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    setSessions(data);
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchSessions();
  }, [fetchSubjects, fetchSessions]);

  const handleDataUpdate = () => {
    fetchSessions();
  };

  const handleSubjectUpdate = () => {
    fetchSubjects();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">学習記録</h1>
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
          <Timer subjects={subjects} onSave={handleDataUpdate} />
        )}
        {tab === "manual" && (
          <ManualEntry subjects={subjects} onSave={handleDataUpdate} />
        )}
        {tab === "history" && (
          <History sessions={sessions} onDelete={handleDataUpdate} />
        )}
        {tab === "stats" && <Stats sessions={sessions} />}
        {tab === "subjects" && (
          <SubjectManager subjects={subjects} onUpdate={handleSubjectUpdate} />
        )}
      </div>
    </div>
  );
}
