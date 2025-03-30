import { Button, Paper } from "@mui/material";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Paper
      component="form"
      sx={{
        p: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "40vw",
        maxWidth: 450,
        zIndex: 9999,
      }}
    >
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        isClearable
        placeholderText="Select a date range"
      />
      <Button
        variant="outlined"
        sx={{ background: "#333", color: "#fff" }}
        onClick={() => {
          if (startDate && endDate) {
            onDateChange(startDate, endDate);
          } else {
            alert("Please select a valid date range!");
          }
        }}
      >
        Search
      </Button>
    </Paper>
  );
};

export default DateRangePicker;
