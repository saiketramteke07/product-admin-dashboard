export function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Product", "Category", "Price", "Rating", "Stock", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-20" />
              </td>
              <td className="px-4 py-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-8" />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-10" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-10" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-14" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-40 bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
