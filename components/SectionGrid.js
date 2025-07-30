// components/SectionGrid.js

export default function SectionGrid({ children }) {
  return (
    <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {children}
      </div>
    </div>
  );
}
