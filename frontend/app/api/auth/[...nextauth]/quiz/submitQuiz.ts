const submitQuiz = async (quizId: string, submittedAnswers: { questionId: string; answer: string }[]) => {
    const response = await fetch(`http://localhost:5000/quiz/submit/${quizId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submittedAnswers }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to submit quiz");
    }
  
    return response.json();
  };
  
  export default submitQuiz;
  