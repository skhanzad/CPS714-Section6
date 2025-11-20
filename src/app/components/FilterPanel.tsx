"use client";

export default function FilterPanel({ filters, setFilters, showAvailableOnly, setShowAvailableOnly }) {
  // Search input
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Category toggle
  const handleCategoryToggle = (category) => {
    if (filters.categories.includes(category)) {
      setFilters({
        ...filters,
        categories: filters.categories.filter((c) => c !== category),
      });
    } else {
      setFilters({ ...filters, categories: [...filters.categories, category] });
    }
  };

  // Date range
  const handleFromChange = (e) => setFilters({ ...filters, from: e.target.value });
  const handleToChange = (e) => setFilters({ ...filters, to: e.target.value });

  // Available toggle
  const handleAvailableToggle = () => setShowAvailableOnly(!showAvailableOnly);

  return (
    <aside className="w-80 bg-[#F6F6F6] p-5 rounded-lg border">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search (name or description)"
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date range */}
      <h3 className="font-bold text-lg border-b pb-1 mb-3">Event Date</h3>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input type="date" className="w-full px-2 py-1 border rounded-md" value={filters.from} onChange={handleFromChange} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input type="date" className="w-full px-2 py-1 border rounded-md" value={filters.to} onChange={handleToChange} />
        </div>
      </div>

      {/* Available Only */}
      <div className="flex items-center space-x-2 mb-5">
        <input
          type="checkbox"
          id="availableOnly"
          className="accent-blue-600"
          checked={showAvailableOnly}
          onChange={handleAvailableToggle}
        />
        <label htmlFor="availableOnly" className="text-gray-700">
          Available Only
        </label>
      </div>

      {/* Categories */}
      <h3 className="font-bold text-lg border-b pb-1 mb-3 text-[#004C9B]">Event Category</h3>
      <div className="flex flex-col space-y-2">
        {["Academics", "Sports", "Social"].map((cat) => (
          <label key={cat} className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={filters.categories.includes(cat)}
              onChange={() => handleCategoryToggle(cat)}
            />
            <span>{cat}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}
