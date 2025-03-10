import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
    if (feature.properties && feature.properties.permitnum) {
      layer.bindPopup(`Permit Number: ${feature.properties.permitnum}`);
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
