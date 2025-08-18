"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-600 mb-4">Erreur</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Quelque chose s&apos;est mal passé
                </h2>
                <p className="text-gray-600 mb-8">
                    Une erreur inattendue s&apos;est produite. Veuillez réessayer.
                </p>
                <div className="space-x-4">
                    <Button onClick={reset} variant="primary">
                        Réessayer
                    </Button>
                    <Button
                        onClick={() => window.location.href = "/"}
                        variant="outline"
                    >
                        Retour à l&apos;accueil
                    </Button>
                </div>
            </div>
        </div>
    );
}
