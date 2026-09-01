import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata for Apple Touch Icon
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: '40px',
          border: '5px solid rgba(56, 189, 248, 0.45)',
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
            fontSize: 110,
            lineHeight: 1,
            letterSpacing: '-6px',
          }}
        >
          {/* Letter i with bright cyan accent */}
          <span
            style={{
              color: '#38BDF8',
              marginRight: '2px',
              textShadow: '0 4px 16px rgba(56,189,248,0.5)',
            }}
          >
            i
          </span>
          {/* Letter W in crisp white */}
          <span
            style={{
              color: '#FFFFFF',
              letterSpacing: '-4px',
              textShadow: '0 4px 16px rgba(0,0,0,0.6)',
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
