import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation for Next.js App Router Favicon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0E2A40 0%, #05121E 100%)',
          borderRadius: '7px',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 900,
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: '-1.5px',
          }}
        >
          {/* Letter i with bright cyan accent */}
          <span
            style={{
              color: '#38BDF8',
              marginRight: '0.5px',
              textShadow: '0 0 4px rgba(56,189,248,0.5)',
            }}
          >
            i
          </span>
          {/* Letter W in crisp white */}
          <span
            style={{
              color: '#FFFFFF',
              letterSpacing: '-1px',
            }}
          >
            W
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
