export default function HrShiftTable({ shifts = [], onEdit, onDelete, onCopy }) {
  return (
    <table className="mb-4 table-auto w-full">
      <thead>
        <tr>
          <th className="px-2 py-1">Employee</th>
          <th className="px-2 py-1">Start</th>
          <th className="px-2 py-1">End</th>
          <th className="px-2 py-1"></th>
        </tr>
      </thead>
      <tbody>
        {shifts.map(s => (
          <tr key={s.id}>
            <td className="px-2 py-1">{s.employee_id}</td>
            <td className="px-2 py-1">{s.start_time}</td>
            <td className="px-2 py-1">{s.end_time}</td>
            <td className="px-2 py-1 space-x-1">
              {onEdit && (
                <button
                  className="button px-2 text-sm"
                  onClick={() => onEdit(s)}
                >
                  Edit
                </button>
              )}
              {onCopy && (
                <button
                  className="button px-2 text-sm"
                  onClick={() => onCopy(s)}
                >
                  Copy
                </button>
              )}
              {onDelete && (
                <button
                  className="button px-2 text-sm bg-red-600 hover:bg-red-700"
                  onClick={() => onDelete(s)}
                >
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
