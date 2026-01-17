import { useState } from "react";
import { HomePage } from "@/app/components/home/HomePage";
import { QuizPage } from "@/app/components/QuizPage";

export default function App() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return <QuizPage />;
  }

  return <HomePage onStartTest={() => setShowQuiz(true)} />;
}