function Error({ statusCode }) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                    {statusCode || 'Erreur'}
                </h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                    {statusCode === 404 ? 'Page non trouvée' : 'Une erreur est survenue'}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    {statusCode === 404
                        ? 'La page que vous recherchez n\'existe pas.'
                        : 'Une erreur inattendue s\'est produite.'}
                </p>
                <a
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.75rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        textDecoration: 'none'
                    }}
                >
                    Retour à l'accueil
                </a>
            </div>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
