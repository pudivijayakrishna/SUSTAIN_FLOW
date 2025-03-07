import React from 'react';
import { useAuth } from '../context/auth';

const DonorDashboard = () => {
  const { role } = useAuth();

  return (
    <div>
      <h1>Donor Dashboard</h1>
      {/* Add donor-specific features here */}
    </div>
  );
};

export default DonorDashboard; 