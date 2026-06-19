"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: 1,
    question: "What is the time complexity of searching for an element in a Balanced Binary Search Tree (e.g. AVL tree) in the worst case?",
    options: { A: "O(1)", B: "O(log n)", C: "O(n)", D: "O(n log n)" },
  },
  {
    id: 2,
    question: "Which of the following data structures operates on a First-In-First-Out (FIFO) access policy?",
    options: { A: "Stack", B: "Priority Queue", C: "Queue", D: "Binary Tree" },
  },
  {
    id: 3,
    question: "What is the time complexity of the worst-case scenario for QuickSort sorting algorithm?",
    options: { A: "O(n^2)", B: "O(n log n)", C: "O(n)", D: "O(log n)" },
  },
  {
    id: 4,
    question: "Which graph algorithm is designed to find the Single Source Shortest Path in a weighted graph with non-negative edge weights?",
    options: { A: "Kruskal's", B: "Prim's", C: "Bellman-Ford", D: "Dijkstra's" },
  },
  {
    id: 5,
    question: "What is the auxiliary space complexity of Merge Sort when implemented recursively for arrays?",
    options: { A: "O(1)", B: "O(n)", C: "O(log n)", D: "O(n^2)" },
  },
];

interface DsaQuizProps {
  currentDsaScore: number;
}

export default function DsaQuiz({ currentDsaScore }: DsaQuizProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
    newReadinessScore: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSelectAnswer = (qId: number, option: string) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < QUESTIONS.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/student/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to submit assessment.");

      const data = await res.json();
      setResult({
        score: data.score,
        correctCount: data.correctCount,
        totalCount: data.totalCount,
        newReadinessScore: data.newReadinessScore,
      });
      setQuizFinished(true);
      router.refresh();
    } catch (err) {
      alert("Error submitting assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isAllAnswered = Object.keys(answers).length === QUESTIONS.length;

  if (quizFinished && result) {
    return (
      <div className="card glass" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "3rem" }}>
        <span style={{ fontSize: "3rem" }}>🎉</span>
        <h2 style={{ marginTop: "1rem" }}>Assessment Completed!</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Your answers have been checked and evaluated.</p>
        
        <div style={{ display: "flex", justifyContent: "space-around", margin: "2rem 0", padding: "1.5rem", background: "var(--bg-main)", borderRadius: "var(--radius-md)" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--primary)" }}>
              {result.score}%
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>DSA SCORE</span>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)" }}></div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--success)" }}>
              {result.newReadinessScore}%
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>NEW READINESS</span>
          </div>
        </div>

        <p style={{ fontSize: "0.95rem", marginBottom: "2rem" }}>
          You answered <strong>{result.correctCount}</strong> out of {result.totalCount} questions correctly. 
          Your new placement readiness score is reflected on your dashboard.
        </p>

        <button 
          onClick={() => {
            setQuizFinished(false);
            setQuizStarted(false);
            setAnswers({});
          }} 
          className="btn btn-primary"
        >
          Retake Assessment
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="card glass" style={{ maxWidth: "600px", margin: "0 auto", padding: "2.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>DSA Technical Assessment</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
          This assessment tests your core knowledge of Data Structures and Algorithms. 
          Your score accounts for **10% of your total Placement Readiness score**.
        </p>

        <div className="stat-card card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
          <div className="stat-icon" style={{ backgroundColor: "#f3e8ff", color: "#a855f7" }}>💻</div>
          <div className="stat-info">
            <span className="stat-label">Your Current DSA Score</span>
            <span className="stat-value">{currentDsaScore}%</span>
          </div>
        </div>

        <ul style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginLeft: "1.25rem", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <li>Total Questions: 5 Multiple Choice</li>
          <li>Topics: Complexity Analysis, Stacks, Queues, Sorting, Graphs</li>
          <li>Weight: 10 points added to Readiness index at 100%</li>
          <li>No negative marking. You can retake the assessment.</li>
        </ul>

        <button onClick={() => setQuizStarted(true)} className="btn btn-primary" style={{ width: "100%" }}>
          🚀 Start Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="card glass" style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <h3>DSA Assessment Session</h3>
        <span className="badge badge-info">
          Progress: {Object.keys(answers).length} / {QUESTIONS.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {QUESTIONS.map((q, idx) => (
          <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h4 style={{ fontSize: "1rem", lineHeight: "1.4" }}>
              {idx + 1}. {q.question}
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingLeft: "0.5rem" }}>
              {Object.entries(q.options).map(([key, val]) => {
                const isSelected = answers[q.id] === key;
                return (
                  <label 
                    key={key} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.75rem", 
                      padding: "0.75rem 1rem", 
                      border: `1px solid ${isSelected ? "var(--primary-light)" : "var(--border)"}`, 
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: isSelected ? "rgba(59, 130, 246, 0.05)" : "transparent",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      transition: "all 0.2s"
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={key}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(q.id, key)}
                      style={{ cursor: "pointer" }}
                    />
                    <strong>{key}:</strong> {val}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: "100%", padding: "1rem", marginTop: "1rem" }}
          disabled={loading || !isAllAnswered}
        >
          {loading ? "Evaluating submission..." : "Submit Assessment"}
        </button>
      </form>
    </div>
  );
}
