import { ImageResponse } from 'next/og';
export const runtime = 'edge';
export const alt = 'Projects';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div style={{
                height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: 64, background: 'linear-gradient(135deg,#10b981,#065f46)',
                color: 'white'
            }}>
                <div style={{ fontSize: 54, fontWeight: 700, marginBottom: 12 }}>
                    Projects
                </div>
                <div style={{ fontSize: 28, opacity: 0.9 }}>
                    A curated selection of my tools & scripts
                </div>
            </div>
        ), size
    );
}
