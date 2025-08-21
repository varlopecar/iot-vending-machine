// Force dynamic rendering to prevent prerendering errors  
export const dynamic = 'force-dynamic';

export default function Custom500() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8 text-center">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 text-red-600">⚠️</div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Erreur serveur
                    </h1>
                    <p className="text-gray-600">
                        Une erreur interne du serveur s'est produite.
                    </p>
                </div>

                <a href="/" className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 w-full">
                    🏠 Retour à l'accueil
                </a>
            </div>
        </div>
    );
}
