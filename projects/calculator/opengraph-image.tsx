import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'Average Purchase Price Calculator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div style={{
                height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: 64, background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)',
                color: 'white'
            }}>
                <div style={{ fontSize: 54, fontWeight: 700, marginBottom: 12 }}>
                    Average Purchase Price Calculator
                </div>
                <div style={{ fontSize: 28, opacity: 0.9 }}>
                    Simulate buys, see new averages, export CSV
                </div>
            </div>
        ), size
    );
}
