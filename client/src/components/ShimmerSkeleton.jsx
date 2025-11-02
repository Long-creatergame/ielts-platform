/**
 * ShimmerSkeleton Component
 * Loading skeleton for dashboard tabs and content areas
 */

const ShimmerSkeleton = ({ type = 'default' }) => {
  if (type === 'card') {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
        <div className="h-64 bg-gray-200 rounded" />
        <div className="mt-4 flex justify-around">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'test-result') {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-300 rounded w-1/4" />
          <div className="h-12 w-24 bg-gray-300 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Default
  return (
    <div className="animate-pulse p-4">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  );
};

export default ShimmerSkeleton;

