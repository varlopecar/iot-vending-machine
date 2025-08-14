export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-1">
          Analyses détaillées de vos performances
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Produits populaires</div>
            <p className="text-sm">Classement des produits les plus vendus</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Revenus par machine</div>
            <p className="text-sm">Performance de chaque distributeur</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Évolution des ventes</div>
            <p className="text-sm">Tendances sur les derniers mois</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Horaires de pointe</div>
            <p className="text-sm">Analyse des pics de fréquentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
