import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatDate } from "../utils/functions";

const Home = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("https://data.calgary.ca/resource/c2es-76ed.geojson")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.features) {
          setGeoData(data);
        } else {
          console.error("Invalid GeoJSON data:", data);
        }
      })
      .catch((error) => console.error("Error fetching GeoJSON data:", error));
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = `
         <div style="padding: 16px; font-family: 'Roboto', sans-serif;">
          <h2 style="margin: 0; font-size: 1.25rem;">Permit Details</h2>
          <p style="margin: 8px 0;"><strong>Permit Number:</strong> ${
            feature.properties.permitnum
          }</p>
          <p style="margin: 8px 0;"><strong>Community Name:</strong> ${
            feature.properties.communityname
          }</p>

          <p style="margin: 8px 0;"><strong>Issue Date:</strong> ${
            feature.properties.issueddate === null
              ? "Not Available"
              : formatDate(feature.properties.issueddate)
          }</p>
          <p style="margin: 8px 0;"><strong>Contractor Name:</strong> ${
            feature.properties.contractorname === null
              ? "Not Available"
              : feature.properties.contractorname
          }</p>
          <p style="margin: 8px 0;"><strong>Workclass Group:</strong> ${
            feature.properties.workclassgroup
          }</p>
          <p style="margin: 8px 0;"><strong>Original Address:</strong> ${
            feature.properties.originaladdress
          }</p>
        </div>
      `;
      layer.bindPopup(popupContent);
    }
  };

  // API url -
  // https://data.calgary.ca/resource/c2es-76ed.json

  return (
    <section className="main__frame">
      <Header />

      <MapContainer
        center={[51.0447, -114.0719]}
        zoom={12}
        className="map__container"
        style={{ height: "100vh" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
      </MapContainer>
    </section>
  );
};

export default Home;
