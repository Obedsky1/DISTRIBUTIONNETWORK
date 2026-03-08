import { ImageResponse } from 'next/og';
import { getPlatformBySlug } from '@/lib/pseo/platforms';

export const alt = 'Platform Preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
    const platform = await getPlatformBySlug(params.slug);

    const name = platform?.name || 'Platform';
    const da = platform?.domainAuthority || 0;
    const pricing = platform?.pricing || 'N/A';
    const backlink = platform?.backlinkType || 'N/A';
    const type = platform?.type || 'directory';
    const category = platform?.category || 'Startup Directory';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 40%, #0a0a1a 100%)',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                {/* Top: Logo + site name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 700,
                        }}
                    >
                        C
                    </div>
                    <span style={{ color: '#9ca3af', fontSize: '20px' }}>DistriBurst</span>
                </div>

                {/* Middle: Platform name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                        style={{
                            fontSize: '52px',
                            fontWeight: 800,
                            background: 'linear-gradient(90deg, #c084fc, #f472b6)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1.1,
                        }}
                    >
                        Submit to {name}
                    </div>
                    <div style={{ fontSize: '22px', color: '#9ca3af' }}>
                        {category} · {type}
                    </div>
                </div>

                {/* Bottom: Stats bar */}
                <div
                    style={{
                        display: 'flex',
                        gap: '32px',
                        padding: '20px 28px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>DA Score</span>
                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>{da}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Pricing</span>
                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>{pricing}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Backlinks</span>
                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>{backlink}</span>
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
