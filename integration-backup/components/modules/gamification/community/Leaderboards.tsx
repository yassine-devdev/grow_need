
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const Leaderboards: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Leaderboards"
        breadcrumbs="Community / Leaderboards"
        icon={<Icons.Leaderboards size={64} />}
    />
  );
};

export default Leaderboards;