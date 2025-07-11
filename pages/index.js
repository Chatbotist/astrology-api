export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Astrology API</h1>
      <p>Send POST request to <code>/api/calculate_chart</code></p>
      <pre>
        {JSON.stringify({
          dob: "DD/MM/YYYY",
          time: "HH:MM (optional)",
          place_of_birth: "City, Country",
          latitude: "Optional",
          longitude: "Optional"
        }, null, 2)}
      </pre>
    </div>
  );
}
