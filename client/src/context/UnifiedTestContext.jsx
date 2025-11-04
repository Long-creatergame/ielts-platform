import React, { createContext, useContext, useState, useCallback } from 'react';

const UnifiedTestContext = createContext();

export function UnifiedTestProvider({ children }) {
  const [currentTest, setCurrentTest] = useState(null);
  const [skill, setSkill] = useState(null);
  const [answers, setAnswers] = useState({});
  const [bandResult, setBandResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetContext = useCallback(() => {
    setCurrentTest(null);
    setSkill(null);
    setAnswers({});
    setBandResult(null);
    setError(null);
  }, []);

  const setSkillAndReset = useCallback((newSkill) => {
    resetContext();
    setSkill(newSkill);
  }, [resetContext]);

  const updateAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const setTestResult = useCallback((result) => {
    setBandResult(result);
  }, []);

  const value = {
    currentTest,
    setCurrentTest,
    skill,
    setSkill: setSkillAndReset,
    answers,
    updateAnswer,
    setAnswers,
    bandResult,
    setTestResult,
    loading,
    setLoading,
    error,
    setError,
    resetContext
  };

  return (
    <UnifiedTestContext.Provider value={value}>
      {children}
    </UnifiedTestContext.Provider>
  );
}

export function useUnifiedTest() {
  const context = useContext(UnifiedTestContext);
  if (!context) {
    throw new Error('useUnifiedTest must be used within UnifiedTestProvider');
  }
  return context;
}

