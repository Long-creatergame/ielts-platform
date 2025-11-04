import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ExamStart() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode') || 'cambridge';
  const skill = params.get('skill') || 'reading';
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Start {mode} exam</h1>
      <p className="mb-4">Skill: {skill}</p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate(`/exam/view?mode=${mode}&skill=${skill}`)}>Begin</button>
    </div>
  );
}


