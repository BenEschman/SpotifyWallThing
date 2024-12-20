import React, { useState } from "react";

function Search({ onSearch, className }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() !== "") {
      onSearch(query);
    }
  };

  return (
    <div>
      <input
        type="text"
        className={className}
        placeholder="Search for a song, album, or artist"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}className="search_button">Search</button>
    </div>
  );
}

export default Search;