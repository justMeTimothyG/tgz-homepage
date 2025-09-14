import Link from 'next/link';

export default function Custom500() {
  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', fontWeight: 800}}>500</h1>
        <p style={{marginTop: '1rem'}}>Es ist ein Fehler aufgetreten.</p>
        <Link href="/" style={{display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#2563eb', color: '#fff'}}>Zur Startseite</Link>
      </div>
    </div>
  );
}
