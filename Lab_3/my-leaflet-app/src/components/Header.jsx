import { Link } from "react-router-dom";
// import locationIcon from '@iconify/icons-mdi/fire-alert'

const Header = () => {
  return (
    <nav className="header">
      <div className="search__bar">
        <input
          type="text"
          placeholder="Search location..."
          // value={searchInput}
          // onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
        // onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div>
        <Link to="/" style={{ color: "white", marginRight: "15px" }}>
          Home
        </Link>
        <Link to="/about" style={{ color: "white" }}>
          About
        </Link>
      </div>
    </nav>
  );
};

export default Header;
