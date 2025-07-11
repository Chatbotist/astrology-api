export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Astrology API</h1>
      <p>Send POST request to <code>/api/calculate_chart</code> with:</p>
      <pre>
        {JSON.stringify({
          dob: "DD/MM/YYYY",
          time: "HH:MM (optional)",
          place_of_birth: "City, Country",
          latitude: "55.7558 (optional)",
          longitude: "37.6176 (optional)"
        }, null, 2)}
      </pre>
    </div>
  );
}
