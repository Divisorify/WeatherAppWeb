import { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE = "";

function WindIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function TempIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function parseWeatherText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function parseGeoText(text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
  }
  return null;
}

function getWeatherEmoji(temp) {
  const t = parseFloat(temp);
  if (isNaN(t)) return "🌡️";
  if (t <= 0) return "❄️";
  if (t <= 10) return "🥶";
  if (t <= 18) return "🌥️";
  if (t <= 25) return "🌤️";
  return "☀️";
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  try {
    const date = new Date(timeStr);
    return date.toLocaleString("pl-PL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return timeStr;
  }
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function fetchWeather() {
    const trimmed = city.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setWeather(null);
    setGeo(null);

    try {
      const [weatherRes, geoRes] = await Promise.all([
        fetch(`${API_BASE}/weather?city=${encodeURIComponent(trimmed)}`),
        fetch(`${API_BASE}/geo?city=${encodeURIComponent(trimmed)}`),
      ]);

      if (!weatherRes.ok) throw new Error(`Błąd serwera: ${weatherRes.status}`);
      if (!geoRes.ok) throw new Error(`Błąd serwera geolokalizacji: ${geoRes.status}`);

      const parsedWeather = await weatherRes.json();  // ← bezpośrednio JSON
      const geoText = await geoRes.text();

      const parsedGeo = parseGeoText(geoText);

      setWeather(parsedWeather);
      setGeo(parsedGeo);

      setHistory((prev) => {
        const updated = [trimmed, ...prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase())];
        return updated.slice(0, 5);
      });
    } catch (err) {
      setError(err.message || "Nie można połączyć się z serwerem. Upewnij się, że backend działa na porcie 8080.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") fetchWeather();
  }

  function handleHistoryClick(c) {
    setCity(c);
    setTimeout(() => {
      setCity(c);
    }, 0);
  }

  useEffect(() => {
    if (city && history.includes(city)) {
      fetchWeather();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="app">
      <div className="bg-orbs">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">AERO</span>
            <span className="logo-sub">weather</span>
          </div>
          <p className="tagline">Aktualna pogoda dla każdego miasta</p>
        </header>

        <div className="search-section">
          <div className="search-box">
            <LocationIcon />
            <input
              ref={inputRef}
              type="text"
              placeholder="Wpisz nazwę miasta..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
            <button
              onClick={fetchWeather}
              disabled={loading || !city.trim()}
              className="search-btn"
            >
              {loading ? <span className="spinner" /> : "Szukaj"}
            </button>
          </div>

          {history.length > 0 && (
            <div className="history">
              <span className="history-label">Ostatnio:</span>
              {history.map((c) => (
                <button
                  key={c}
                  className="history-tag"
                  onClick={() => {
                    setCity(c);
                    setTimeout(() => fetchWeather(), 0);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="error-card">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <div className="weather-card">
            <div className="weather-header">
              <div className="city-name">
                <LocationIcon />
                <h2>{city}</h2>
              </div>
              <div className="weather-emoji">{getWeatherEmoji(weather.temperature_2m)}</div>
            </div>

            <div className="temp-display">
              <span className="temp-value">{weather.temperature_2m ?? "—"}</span>
              <span className="temp-unit">°C</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon wind">
                  <WindIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Prędkość wiatru</span>
                  <span className="stat-value">{weather.wind_speed_10m ?? "—"} <em>km/h</em></span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon humidity">
                  <HumidityIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Wilgotność</span>
                  <span className="stat-value">{weather.relative_humidity_2m ?? "—"} <em>%</em></span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon temp">
                  <TempIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Temperatura</span>
                  <span className="stat-value">{weather.temperature_2m ?? "—"} <em>°C</em></span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon clock">
                  <ClockIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Czas pomiaru</span>
                  <span className="stat-value small">{formatTime(weather.time)}</span>
                </div>
              </div>
            </div>

            {geo && (
              <div className="geo-row">
                <span className="geo-label">📍 Współrzędne:</span>
                <span className="geo-value">
                  {geo.lat.toFixed(4)}°N, {geo.lon.toFixed(4)}°E
                </span>
                <a
                  href={`https://www.google.com/maps?q=${geo.lat},${geo.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Pokaż na mapie →
                </a>
              </div>
            )}

            {weather.interval && (
              <div className="interval-info">
                Interwał odczytu: <strong>{weather.interval}s</strong>
              </div>
            )}
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <p>Wpisz nazwę miasta, aby sprawdzić pogodę</p>
            <div className="suggestions">
              {["Berlin", "Warsaw", "Paris", "Tokio"].map((c) => (
                <button key={c} className="suggestion-btn" onClick={() => { setCity(c); setTimeout(fetchWeather, 0); }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="footer">
          Dane z backendu Spring Boot · localhost:8080
        </footer>
      </div>
    </div>
  );
}
