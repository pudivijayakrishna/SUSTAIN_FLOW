import React from 'react';
import { useAuth } from '../context/auth';

const AgencyDashboard = () => {
  const { role } = useAuth();

  return (
    <div>
      <h1>Composting Agency Dashboard</h1>
      {/* Add agency-specific features here */}
    </div>
  );
};

export default AgencyDashboard; 