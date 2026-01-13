import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { PersonalityTypes } from "./components/PersonalityTypes";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { QuizContainer } from "./components/quiz/QuizContainer";

export default function App() {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizComplete = (answers: Record<number, number>) => {
    console.log('Quiz completed with answers:', answers);
    // TODO: Calculate personality type and show results
    alert(`Quiz completed! You answered ${Object.keys(answers).length} questions.`);
    setShowQuiz(false);
  };

  if (showQuiz) {
    return <QuizContainer onComplete={handleQuizComplete} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar onStartQuiz={handleStartQuiz} />
      <Hero onStartQuiz={handleStartQuiz} />
      <Features />
      <PersonalityTypes onStartQuiz={handleStartQuiz} />
      <Testimonials />
      <CTA onStartQuiz={handleStartQuiz} />
      <Footer />
    </div>
  );
}