// pages/office/scheduling/index.js

import React from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import SchedulingCalendar from '../../../components/SchedulingCalendar';

const SchedulingPage = () => (
  <OfficeLayout>
    <h1 className='text-xl font-semibold'>Scheduling</h1>
    <SchedulingCalendar />
  </OfficeLayout>
);

export default SchedulingPage;
