import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Page non trouvée
                </h2>
                <p className="text-gray-600 mb-8">
                    La page que vous recherchez n&apos;existe pas.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-10 px-4"
                >
                    Retour à l&apos;accueil
                </Link>
            </div>
        </div>
    );
}
