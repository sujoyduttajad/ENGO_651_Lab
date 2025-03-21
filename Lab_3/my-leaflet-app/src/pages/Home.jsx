import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatDate } from "../utils/functions";
import { CircularProgress, FormControlLabel, Switch } from "@mui/material";
import { process } from "dotenv"

const Home = () => {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMapbox, setShowMapbox] = useState(false);

  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const MAPBOX_STYLE_ID = import.meta.env.VITE_MAPBOX_STYLE_ID; 

  // Fetch All Permits on Initial Load
  useEffect(() => {
    if (geoData.length === 0) {
      setLoading(true);
      fetch("https://data.calgary.ca/resource/c2es-76ed.geojson")
        .then((response) => response.json())
        .then((data) => setGeoData(data.features ? data.features : []))
        .catch((error) => console.error("Error fetching data:", error))
        .finally(() => setLoading(false));
    }
  }, []);
  

  // Fetch permits based on date range selection
  const fetchFilteredPermits = async (start, end) => {
    if (!start || !end) return alert("Please select a valid date range!");
  
    setLoading(true);
    const startFormatted = start.toISOString().split("T")[0];
    const endFormatted = end.toISOString().split("T")[0];
  
    const apiUrl = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate >= '${startFormatted}' AND issueddate <= '${endFormatted}'`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setGeoData([]); 
      setTimeout(() => setGeoData(data.features ? data.features : []), 500); 
    } catch (error) {
      console.error("Error fetching permits:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = `
        <div style="padding: 16px; font-family: 'Roboto', sans-serif;">
          <h2 style="margin: 0; font-size: 1.25rem;">Permit Details</h2>
          <p><strong>Permit Number:</strong> ${
            feature.properties.permitnum || "Not Available"
          }</p>
          <p><strong>Community Name:</strong> ${
            feature.properties.communityname || "Not Available"
          }</p>
          <p><strong>Issue Date:</strong> ${
            feature.properties.issueddate
              ? formatDate(feature.properties.issueddate)
              : "Not Available"
          }</p>
          <p><strong>Contractor Name:</strong> ${
            feature.properties.contractorname || "Not Available"
          }</p>
          <p><strong>Workclass Group:</strong> ${
            feature.properties.workclassgroup || "Not Available"
          }</p>
          <p><strong>Original Address:</strong> ${
            feature.properties.originaladdress || "Not Available"
          }</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    // <section className="main__frame">
    //   <Header fetchPermits={fetchFilteredPermits} />

    //   {loading && (
    //     <div
    //       style={{
    //         position: "absolute",
    //         top: "50%",
    //         left: "50%",
    //         zIndex: 9999,
    //       }}
    //     >
    //       <CircularProgress />
    //     </div>
    //   )}

    //   <MapContainer
    //     center={[51.0447, -114.0719]}
    //     zoom={12}
    //     className="map__container"
    //     style={{ height: "100vh" }}
    //   >
    //     <TileLayer
    //       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //       attribution="&copy; OpenStreetMap contributors"
    //     />
    //     {geoData.length > 0 && (
    //       <GeoJSON key={geoData.length} data={geoData} onEachFeature={onEachFeature} />
    //     )}
    //   </MapContainer>
    // </section>
    <section className="main__frame">
    <Header fetchPermits={fetchFilteredPermits} />

    <FormControlLabel
      control={
        <Switch
          checked={showMapbox}
          onChange={(e) => setShowMapbox(e.target.checked)}
          color="primary"
        />
      }
      label="Toggle Mapbox Layer"
      style={{ position: "absolute", top: 90, left: 20, zIndex: 9999 }}
    />

    {loading && (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: 9999,
        }}
      >
        <CircularProgress />
      </div>
    )}

    <MapContainer
      center={[51.0447, -114.0719]}
      zoom={12}
      className="map__container"
      style={{ height: "100vh" }}
    >
      {/* Default Base Layer: OpenStreetMap */}
      {!showMapbox && (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
      )}

      {/* Mapbox Style Layer (custom style or streets-v11) */}
      {showMapbox && (
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_ID}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
          attribution="&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>"
          tileSize={512}
          zoomOffset={-1}
        />
      )}

      {geoData.length > 0 && (
        <GeoJSON key={geoData.length} data={geoData} onEachFeature={onEachFeature} />
      )}
    </MapContainer>
  </section>
  );
};

export default Home;
