
import React from 'react';
import { Icons } from '../../../icons';
import LearningGamePlaceholder from './LearningGamePlaceholder';

const MathGame: React.FC = () => {
  return (
    <LearningGamePlaceholder
        title="Math Games"
        breadcrumbs="Learning Games / Math"
        icon={<Icons.MathGame size={64} />}
    />
  );
};

export default MathGame;