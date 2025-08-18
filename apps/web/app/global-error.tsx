"use client";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="fr">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-red-600 mb-4">Erreur</h1>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Quelque chose s&apos;est mal passé
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Une erreur inattendue s&apos;est produite. Veuillez recharger la page.
                        </p>
                        <button
                            onClick={reset}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
