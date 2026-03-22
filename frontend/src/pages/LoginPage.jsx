import { useEffect, useState } from "react";

const LoginPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div style={styles.root}>
      {/* Animated background */}
      <div style={styles.bgGradient} />
      <div style={styles.bgGrid} />

      {/* Floating decorative circles */}
      <div style={styles.circle1} />
      <div style={styles.circle2} />
      <div style={styles.circle3} />

      <div style={{
        ...styles.container,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🏸</div>
        </div>

        {/* Brand */}
        <div style={styles.brand}>
          <h1 style={styles.brandName}>BadmintonBook</h1>
          <div style={styles.brandTagline}>
            <span style={styles.taglineDash}>—</span>
            <span>Find. Book. Play.</span>
            <span style={styles.taglineDash}>—</span>
          </div>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Welcome back</p>
          <p style={styles.cardSubtitle}>
            Sign in to discover courts near you
          </p>

          {/* Google Button */}
          <button
            style={styles.googleBtn}
            onClick={handleGoogleLogin}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={styles.googleIcon}
            />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>secure login</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Features */}
          <div style={styles.features}>
            {[
              { icon: '📍', text: 'Courts near you' },
              { icon: '⚡', text: 'Instant booking' },
              { icon: '💳', text: 'Easy payments' },
            ].map((f, i) => (
              <div key={i} style={styles.feature}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={styles.terms}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,25px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  );
};

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0f0a',
    fontFamily: "'DM Sans', sans-serif",
    overflow: 'hidden',
    position: 'relative',
    padding: '24px 16px',
  },
  bgGradient: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(22,163,74,0.3) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
    pointerEvents: 'none',
  },
  circle1: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    animation: 'float1 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  circle2: {
    position: 'fixed',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(134,239,172,0.1) 0%, transparent 70%)',
    bottom: '-50px',
    left: '-50px',
    animation: 'float2 10s ease-in-out infinite',
    pointerEvents: 'none',
  },
  circle3: {
    position: 'fixed',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(22,163,74,0.1) 0%, transparent 70%)',
    top: '40%',
    left: '10%',
    animation: 'float3 7s ease-in-out infinite',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    backgroundColor: 'rgba(22,163,74,0.15)',
    border: '1px solid rgba(22,163,74,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
  },
  logoIcon: {
    fontSize: '36px',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brandName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '36px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-1px',
  },
  brandTagline: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    color: '#16a34a',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  taglineDash: {
    opacity: 0.5,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '36px',
    backdropFilter: 'blur(20px)',
    marginBottom: '16px',
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: '0 0 28px 0',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    color: '#111',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  features: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between',
  },
  feature: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  featureIcon: {
    fontSize: '18px',
  },
  featureText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  terms: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '11px',
    textAlign: 'center',
    lineHeight: 1.6,
    margin: 0,
  },
};

export default LoginPage;