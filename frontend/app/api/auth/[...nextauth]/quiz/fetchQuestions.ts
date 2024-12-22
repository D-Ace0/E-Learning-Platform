const fetchQuestions = async (quizId: string) => {
    const response = await fetch(`http://localhost:5000/quiz/${quizId}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
  
    return response.json();
  };
  
  export default fetchQuestions;
  