import React from 'react';
import { useAuth } from '../context/auth';

const NgoDashboard = () => {
  const { role } = useAuth();

  return (
    <div>
      <h1>NGO Dashboard</h1>
      {/* Add NGO-specific features here */}
    </div>
  );
};

export default NgoDashboard; 