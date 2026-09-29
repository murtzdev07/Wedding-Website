import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Abdeali & Sarrah Wedding Invitation';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#EBE3DA', // Your envelope beige
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          border: '16px solid #5A2E2E', // Deep espresso border
        }}
      >
        {/* Inner Border Box for Luxury Aesthetic */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '94%',
            height: '90%',
            border: '2px solid rgba(179, 139, 77, 0.4)', // Gold subtle border
            borderRadius: '40px',
          }}
        >
          {/* Top Gold Accent */}
          <div style={{ display: 'flex', width: '120px', height: '3px', background: '#B38B4D', marginBottom: '40px' }} />

          <p
            style={{
              color: '#68715D',
              fontSize: '28px',
              letterSpacing: '10px',
              textTransform: 'uppercase',
              marginBottom: '20px',
              fontWeight: 600,
              fontFamily: 'sans-serif',
            }}
          >
            Wedding Invitation
          </p>

          <h1
            style={{
              color: '#8B3A43',
              fontSize: '120px',
              margin: '0 0 10px 0',
              fontWeight: 'normal',
              textAlign: 'center',
            }}
          >
            Abdeali & Sarrah
          </h1>

          <p
            style={{
              color: '#B38B4D',
              fontSize: '32px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              marginTop: '30px',
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
            }}
          >
            Join Us In Our Celebrations
          </p>

          {/* Bottom Gold Accent */}
          <div style={{ display: 'flex', width: '120px', height: '3px', background: '#B38B4D', marginTop: '50px' }} />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}