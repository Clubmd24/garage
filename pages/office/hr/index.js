import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout.jsx';

export default function HrHome() {
  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">HR</h1>
      <ul className="list-disc list-inside space-y-2">
        <li><Link href="/office/hr/shift-scheduling" className="underline">Shift Scheduling</Link></li>
        <li><Link href="/office/hr/holiday-request-management" className="underline">Holiday Request Management</Link></li>
        <li><Link href="/office/hr/attendance-overview" className="underline">Attendance Overview</Link></li>
        <li><Link href="/office/hr/health-safety-info" className="underline">Health &amp; Safety Info</Link></li>
        <li><Link href="/office/hr/payroll-summaries" className="underline">Payroll Summaries</Link></li>
      </ul>
    </OfficeLayout>
  );
}
