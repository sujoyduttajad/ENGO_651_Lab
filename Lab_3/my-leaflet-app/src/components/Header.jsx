import { AppBar, Button } from "@mui/material";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";

const Header = () => {
  return (
    <nav className="header">
      <Paper
        component="form"
        sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 400 }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Building Permits"
          inputProps={{ "aria-label": "search google maps" }}
        />
        <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      <div>
        <Link to="/" style={{ color: "white", marginRight: "15px" }}>
          <Button variant="contained">Home</Button>
        </Link>
        <Link to="/about" style={{ color: "white" }}>
          <Button variant="contained">About</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Header;
