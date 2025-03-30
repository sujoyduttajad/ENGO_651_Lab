import { AppBar, Box, Button, FormControlLabel, Switch } from "@mui/material";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import DateRangePicker from "./DateRangePicker";

const Header = ({ fetchPermits, showMapbox, setShowMapbox }) => {
  return (
    <nav className="header">
      <Box display="flex" justifyContent="space-evenly" alignItems="center">
        <DateRangePicker onDateChange={fetchPermits} />
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={showMapbox}
            onChange={(e) => setShowMapbox(e.target.checked)}
            color="primary"
          />
        }
        label="Toggle Mapbox Layer"
        // style={{ position: "absolute", top: 90, left: 20, zIndex: 9999 }}
      />

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
