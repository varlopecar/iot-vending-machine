// Simple 404 page to prevent prerendering issues
export default function Custom404() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '28rem',
                backgroundColor: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }}>
                    Page non trouvée
                </h1>
                <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem'
                }}>
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <a
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        textDecoration: 'none',
                        width: '100%'
                    }}
                >
                    🏠 Retour à l'accueil
                </a>
            </div>
        </div>
    );
}
