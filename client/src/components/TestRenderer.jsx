/**
 * Test Renderer Component
 * Master component that dynamically renders IELTS forms based on blueprints
 */

import React from 'react';
import { IELTS_TEST_BLUEPRINTS } from '../blueprints/testBlueprints';
import WritingForm from './WritingForm';
import ReadingForm from './ReadingForm';
import ListeningForm from './ListeningForm';
import SpeakingForm from './SpeakingForm';
import Loader from './Loader';

const TestRenderer = ({ skill = 'writing', mode = 'academic', onSubmit, onTimeUp }) => {
  const blueprint = IELTS_TEST_BLUEPRINTS[skill]?.[mode];

  if (!blueprint) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-600 text-lg font-semibold">
          ⚠️ No blueprint found for {skill} ({mode})
        </p>
        <p className="text-gray-600 mt-2">
          Please select a valid test type and mode.
        </p>
      </div>
    );
  }

  // Render the appropriate form based on skill
  switch (skill) {
    case 'writing':
      return <WritingForm blueprint={blueprint} mode={mode} onSubmit={onSubmit} onTimeUp={onTimeUp} />;
    case 'reading':
      return <ReadingForm blueprint={blueprint} mode={mode} onSubmit={onSubmit} onTimeUp={onTimeUp} />;
    case 'listening':
      return <ListeningForm blueprint={blueprint} mode={mode} onSubmit={onSubmit} onTimeUp={onTimeUp} />;
    case 'speaking':
      return <SpeakingForm blueprint={blueprint} mode={mode} onSubmit={onSubmit} onTimeUp={onTimeUp} />;
    default:
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-600 text-lg font-semibold">
            ❌ Invalid skill: {skill}
          </p>
        </div>
      );
  }
};

export default TestRenderer;
