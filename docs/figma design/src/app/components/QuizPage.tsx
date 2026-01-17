import { useState, useEffect } from "react";
import { QuizHeader } from "@/app/components/QuizHeader";
import { QuestionRow } from "@/app/components/QuestionRow";
import { StickyNavigation } from "@/app/components/StickyNavigation";
import { ScaleLegend } from "@/app/components/ScaleLegend";
import { KeyboardHint } from "@/app/components/KeyboardHint";

// Quiz configuration
const QUESTIONS_PER_PAGE = 12;
const TOTAL_QUESTIONS = 120;
const TOTAL_PAGES = TOTAL_QUESTIONS / QUESTIONS_PER_PAGE;

// Mock questions for the personality assessment
const QUIZ_QUESTIONS = [
  // Self-Perception (Questions 1-24)
  "I am comfortable being the center of attention",
  "I prefer working independently rather than in groups",
  "I often think about how my actions affect others",
  "I tend to be more spontaneous than planned",
  "I am energized by social interactions",
  "I value logic over emotions when making decisions",
  "I find it easy to express my feelings to others",
  "I prefer familiar routines over new experiences",
  "I often take charge in group settings",
  "I am sensitive to criticism from others",
  "I enjoy abstract and theoretical discussions",
  "I prefer to keep my options open rather than commit",
  "I often worry about future outcomes",
  "I am quick to forgive others",
  "I value tradition and established methods",
  "I often seek new and exciting experiences",
  "I am comfortable making decisions without all the facts",
  "I prefer depth over breadth in relationships",
  "I tend to see the big picture rather than details",
  "I am guided by my values when making choices",
  "I enjoy debating different viewpoints",
  "I prefer structure and organization in my daily life",
  "I am comfortable with ambiguity and uncertainty",
  "I often analyze situations from multiple perspectives",
  
  // Work Style (Questions 25-48)
  "I thrive in fast-paced work environments",
  "I prefer to complete one task before starting another",
  "I am motivated by competition and achievement",
  "I value harmony in the workplace",
  "I prefer to work with concrete facts and data",
  "I enjoy brainstorming and generating new ideas",
  "I am comfortable delegating tasks to others",
  "I prefer to follow established procedures",
  "I often challenge the status quo",
  "I am detail-oriented in my work",
  "I prefer collaborative projects over solo work",
  "I am comfortable with frequent changes in priorities",
  "I value efficiency over perfection",
  "I prefer to have clear guidelines and expectations",
  "I often take on leadership roles in projects",
  "I am patient when working on long-term projects",
  "I prefer to innovate rather than maintain",
  "I am comfortable working with minimal supervision",
  "I value recognition for my accomplishments",
  "I prefer to plan ahead rather than improvise",
  "I am comfortable with risk-taking in my work",
  "I value quality over quantity in my output",
  "I prefer to work in quiet environments",
  "I am energized by solving complex problems",
  
  // Relationships (Questions 49-72)
  "I have a large circle of friends and acquaintances",
  "I prefer deep conversations over small talk",
  "I am comfortable expressing disagreement with others",
  "I value loyalty above all in friendships",
  "I often initiate social gatherings",
  "I am comfortable being alone for extended periods",
  "I prefer to maintain boundaries in relationships",
  "I am quick to trust new people",
  "I value independence in my relationships",
  "I often prioritize others' needs over my own",
  "I prefer to resolve conflicts immediately",
  "I am comfortable with physical affection",
  "I value intellectual compatibility in relationships",
  "I prefer to keep my personal life private",
  "I am supportive of others' goals and dreams",
  "I value honesty over tact in communication",
  "I prefer to maintain a few close friendships",
  "I am comfortable asking for help when needed",
  "I value shared activities over deep conversation",
  "I often serve as a mediator in conflicts",
  "I prefer spontaneous hangouts over planned events",
  "I am comfortable with emotional vulnerability",
  "I value personal space and alone time",
  "I often maintain long-distance friendships",
  
  // Decision-Making (Questions 73-96)
  "I make decisions based on logic and analysis",
  "I trust my gut feelings when making choices",
  "I prefer to gather all available information before deciding",
  "I am comfortable making quick decisions under pressure",
  "I value consensus when making group decisions",
  "I often defer to experts when facing uncertainty",
  "I prefer to make decisions independently",
  "I am comfortable with irreversible choices",
  "I value long-term consequences over short-term benefits",
  "I often seek advice from others before deciding",
  "I prefer to experiment rather than plan extensively",
  "I am systematic in my approach to problem-solving",
  "I value fairness in my decision-making process",
  "I often change my mind when presented with new information",
  "I prefer to decide based on objective criteria",
  "I am comfortable with calculated risks",
  "I value moral and ethical considerations in my choices",
  "I often procrastinate on difficult decisions",
  "I prefer to decide based on past experiences",
  "I am comfortable making decisions that affect others",
  "I value creativity in finding solutions",
  "I often seek to understand all perspectives before choosing",
  "I prefer practical solutions over innovative ones",
  "I am comfortable making unpopular decisions",
  
  // Values & Motivation (Questions 97-120)
  "I am motivated by personal growth and development",
  "I value financial security and stability",
  "I am driven by a desire to help others",
  "I value creativity and self-expression",
  "I am motivated by recognition and achievement",
  "I value work-life balance",
  "I am driven by curiosity and learning",
  "I value authenticity and being true to myself",
  "I am motivated by challenging myself",
  "I value making a positive impact on society",
  "I am driven by competition and winning",
  "I value personal freedom and autonomy",
  "I am motivated by building meaningful relationships",
  "I value tradition and cultural heritage",
  "I am driven by innovation and progress",
  "I value stability and predictability",
  "I am motivated by exploring new ideas",
  "I value contributing to something larger than myself",
  "I am driven by mastery and expertise",
  "I value experiences over possessions",
  "I am motivated by making a difference",
  "I value efficiency and productivity",
  "I am driven by adventure and excitement",
  "I value inner peace and contentment",
];

// Page categories
const PAGE_CATEGORIES = [
  { title: "Self-Perception", subtitle: "Step 1 of 4 · Self-Perception" },
  { title: "Self-Perception", subtitle: "Step 1 of 4 · Self-Perception" },
  { title: "Work Style", subtitle: "Step 2 of 4 · Work Style" },
  { title: "Work Style", subtitle: "Step 2 of 4 · Work Style" },
  { title: "Relationships", subtitle: "Step 3 of 4 · Relationships" },
  { title: "Relationships", subtitle: "Step 3 of 4 · Relationships" },
  { title: "Decision-Making", subtitle: "Step 3 of 4 · Decision-Making" },
  { title: "Decision-Making", subtitle: "Step 3 of 4 · Decision-Making" },
  { title: "Values & Motivation", subtitle: "Step 4 of 4 · Values & Motivation" },
  { title: "Values & Motivation", subtitle: "Step 4 of 4 · Values & Motivation" },
];

export function QuizPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attemptedNext, setAttemptedNext] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Set<number>>(new Set());

  // Calculate current page questions
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = QUIZ_QUESTIONS.slice(startIndex, endIndex);
  const currentQuestionIds = Array.from(
    { length: QUESTIONS_PER_PAGE },
    (_, i) => startIndex + i
  );

  // Calculate answered count
  const answeredCount = Object.keys(answers).length;
  const isLastPage = currentPage === TOTAL_PAGES;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt/Option + Left Arrow: Previous page
      if (e.altKey && e.key === 'ArrowLeft' && currentPage > 1) {
        e.preventDefault();
        handlePrevious();
      }

      // Alt/Option + Right Arrow: Next page
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, answers]);

  // Handle answer change
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setUnansweredQuestions((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
    setAttemptedNext(false);
  };

  // Validate current page
  const validateCurrentPage = (): boolean => {
    const unanswered = currentQuestionIds.filter((id) => !answers[id]);
    if (unanswered.length > 0) {
      setUnansweredQuestions(new Set(unanswered));
      return false;
    }
    return true;
  };

  // Handle navigation
  const handleNext = () => {
    setAttemptedNext(true);
    
    if (!validateCurrentPage()) {
      return;
    }

    if (isLastPage) {
      // Submit quiz
      console.log("Quiz submitted!", answers);
      alert("Quiz submitted successfully! Check the console for your answers.");
      return;
    }

    // Go to next page
    setCurrentPage((prev) => prev + 1);
    setAttemptedNext(false);
    setUnansweredQuestions(new Set());
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setAttemptedNext(false);
      setUnansweredQuestions(new Set());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageCategory = PAGE_CATEGORIES[currentPage - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-blue-50/30 dark:to-blue-950/10 pb-28">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 lg:py-12 relative z-0">
        {/* Header */}
        <QuizHeader
          title={pageCategory.title}
          subtitle={pageCategory.subtitle}
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          answeredCount={answeredCount}
          totalQuestions={TOTAL_QUESTIONS}
        />

        {/* Scale Legend - Show on first page or when user needs help */}
        {currentPage === 1 && (
          <div className="mt-8">
            <ScaleLegend />
          </div>
        )}

        {/* Compact Scale Reference - Show on subsequent pages */}
        {currentPage > 1 && (
          <div className="mt-6">
            <ScaleLegend variant="compact" />
          </div>
        )}

        {/* Questions */}
        <main className="mt-6 lg:mt-8 space-y-4">
          {currentQuestions.map((question, index) => {
            const questionId = startIndex + index;
            const globalQuestionNumber = questionId + 1;
            const hasError = attemptedNext && unansweredQuestions.has(questionId);

            return (
              <QuestionRow
                key={questionId}
                questionId={String(questionId)}
                questionNumber={globalQuestionNumber}
                questionText={question}
                value={answers[questionId] || null}
                onChange={(value) => handleAnswerChange(questionId, value)}
                hasError={hasError}
              />
            );
          })}
        </main>
      </div>

      {/* Keyboard shortcuts hint */}
      {currentPage === 1 && <KeyboardHint />}

      {/* Sticky Navigation */}
      <StickyNavigation
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={currentPage > 1}
        isLastPage={isLastPage}
        errorMessage={
          attemptedNext && unansweredQuestions.size > 0
            ? "Please answer all questions before continuing."
            : undefined
        }
      />
    </div>
  );
}