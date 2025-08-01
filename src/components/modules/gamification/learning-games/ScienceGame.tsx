
import React from 'react';
import { Icons } from '../../../icons';
import LearningGamePlaceholder from './LearningGamePlaceholder';

const ScienceGame: React.FC = () => {
  return (
    <LearningGamePlaceholder
        title="Science Games"
        breadcrumbs="Learning Games / Science"
        icon={<Icons.ScienceGame size={64} />}
    />
  );
};

export default ScienceGame;