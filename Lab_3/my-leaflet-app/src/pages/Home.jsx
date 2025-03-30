import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { formatDate } from "../utils/functions";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
} from "@mui/material";

const Home = () => {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMapbox, setShowMapbox] = useState(false);

  // MQTT
  const [mqttClient, setMqttClient] = useState(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const MAPBOX_STYLE_ID = import.meta.env.VITE_MAPBOX_STYLE_ID;
  const MAPBOX_USERNAME = import.meta.env.MAPBOX_USERNAME;

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

  // MQTT
  useEffect(() => {
    const topic = "geomatics_engineering/john_doe/my_temperature";
  
    const client = new Paho.MQTT.Client("test.mosquitto.org", 8081, `client_${Math.random()}`);
  
    client.onConnectionLost = () => {
      console.warn("MQTT disconnected, reconnecting...");
      client.connect({ onSuccess, useSSL: true });
    };
  
    client.onMessageArrived = (message) => {
      console.log("Message received:", message.payloadString);
      const data = JSON.parse(message.payloadString);
      // Use the data to update map markers, etc.
    };
  
    const onSuccess = () => {
      console.log("MQTT connected");
      client.subscribe(topic);
    };
  
    client.connect({ onSuccess, useSSL: true });
    setMqttClient(client);
  }, []);

  const updateTempMarker = (lat, lon, temperature) => {
    const color =
      temperature < 10 ? "blue" : temperature < 30 ? "green" : "red";

    const icon = L.divIcon({
      className: "temp-icon",
      html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid #fff"></div>`,
    });

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = L.marker([lat, lon], { icon }).addTo(mapRef.current);
    markerRef.current.bindPopup(`Temp: ${temperature}°C`).openPopup();
  };

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

  const shareStatus = () => {
    if (!mqttClient) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const temperature = Math.floor(Math.random() * 101) - 40;

      const geojson = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: {
          temperature,
        },
      };

      const message = new window.Paho.MQTT.Message(JSON.stringify(geojson));
      message.destinationName =
        "geomatics_engineering/john_doe/my_temperature";
      mqttClient.send(message);
    });
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
    <section className="main__frame">
      <Header
        fetchPermits={fetchFilteredPermits}
        showMapbox={showMapbox}
        setShowMapbox={setShowMapbox}
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

      <Stack
        display="flex"
        justifyContent="flex-start"
        alignItems="flex-start"
        gap={2}
        margin={3}
      >
        <Button variant="contained" onClick={shareStatus}>Share My Status</Button>
      </Stack>

      <MapContainer
        center={[51.0447, -114.0719]}
        zoom={12}
        className="map__container"
        style={{ height: "100vh" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        {!showMapbox && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        )}

        {showMapbox && (
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/wmts?access_token=${MAPBOX_ACCESS_TOKEN}`}
            attribution="&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>"
            tileSize={512}
            zoomOffset={-1}
          />
        )}

        {geoData.length > 0 && (
          <GeoJSON
            key={geoData.length}
            data={geoData}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </section>
  );
};

export default Home;
