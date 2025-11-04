import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ExamModeLayout from '../components/ExamModeLayout';

export default function ExamView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode') || 'cambridge';
  const skill = params.get('skill') || 'reading';
  return (
    <ExamModeLayout mode={mode} skill={skill} onSubmit={(res) => {
      const sessionId = res?.data?.sessionId;
      if (sessionId) navigate(`/exam/result/${sessionId}`);
    }} />
  );
}


