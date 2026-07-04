// @ts-nocheck
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface Issue {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  priority_score: number;
  category: string;
}

export default function Map({ issues }: { issues: Issue[] }) {
  const defaultPosition: [number, number] = [19.0760, 72.8777]; // Mumbai center

  return (
    // @ts-ignore
    <MapContainer 
      center={defaultPosition} 
      zoom={12} 
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map(issue => (
        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-sm">{issue.title}</h3>
              <p className="text-xs text-gray-500">{issue.category}</p>
              <div className="mt-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded inline-block">
                Score: {issue.priority_score}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
