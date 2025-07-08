export default function HrShiftTable({ shifts = [] }) {
  return (
    <table className="mb-4 table-auto w-full">
      <thead>
        <tr>
          <th className="px-2 py-1">Employee</th>
          <th className="px-2 py-1">Start</th>
          <th className="px-2 py-1">End</th>
        </tr>
      </thead>
      <tbody>
        {shifts.map(s => (
          <tr key={s.id}>
            <td className="px-2 py-1">{s.employee_id}</td>
            <td className="px-2 py-1">{s.start_time}</td>
            <td className="px-2 py-1">{s.end_time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
