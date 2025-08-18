"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "../ui";
import { api } from "../../lib/trpc/client";
import { RefreshCw, History, Package } from "lucide-react";

interface MachineRestockHistoryProps {
  machineId: string;
}

type RestockItemType = "addition" | "removal";

export function MachineRestockHistory({
  machineId,
}: MachineRestockHistoryProps) {
  const query = (api as any).restocks.getRestocksByMachine.useQuery(
    { machine_id: machineId },
    { enabled: false }
  );
  const { data, isFetching, error, refetch } = query as typeof query & {
    isFetching?: boolean;
  };

  const [requested, setRequested] = useState(false);
  const [filterType, setFilterType] = useState<"all" | RestockItemType>("all");

  const restocks = data as
    | Array<{
      id: string;
      machine_id: string;
      user_id: string;
      created_at: string;
      notes?: string;
      items: Array<{
        id: string;
        restock_id: string;
        stock_id: string;
        quantity_before: number;
        quantity_after: number;
        quantity_added: number;
        slot_number: number;
        product_name: string;
        product_image_url?: string;
        type?: RestockItemType;
      }>;
    }>
    | undefined;

  // Applique le filtre de type au niveau des items, puis enlève les restocks vides
  const filtered = useMemo(() => {
    if (!restocks) return [] as NonNullable<typeof restocks>;
    return restocks
      .map((r) => ({
        ...r,
        items: r.items.filter((it) =>
          filterType === "all"
            ? true
            : (it.type ?? (it.quantity_added >= 0 ? "addition" : "removal")) ===
            filterType
        ),
      }))
      .filter((r) => r.items.length > 0);
  }, [restocks, filterType]);

  // Restocks triés (plus récents d'abord) et limités à 10 après filtrage
  const sortedLimited = useMemo(() => {
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted.slice(0, 10);
  }, [filtered]);

  // Groupement par date pour l'affichage (sur la liste limitée)
  const groupedByDate = useMemo(() => {
    const list = sortedLimited;
    if (!list || list.length === 0)
      return [] as Array<{ date: string; entries: typeof list }>;
    const map = new Map<string, typeof list>();
    for (const r of list) {
      const day = new Date(r.created_at).toLocaleDateString("fr-FR");
      if (!map.has(day)) map.set(day, [] as any);
      (map.get(day) as any).push(r);
    }
    return Array.from(map.entries()).map(([date, entries]) => ({
      date,
      entries,
    }));
  }, [sortedLimited]);

  const showInitialButton = !requested && !restocks;
  const showLoader = requested && isFetching && !restocks;

  const handleShow = () => {
    setRequested(true);
    refetch();
  };

  const exportCsv = async () => {
    // S'assurer d'avoir toutes les données avant export
    let dataToExport = restocks;
    if (!dataToExport) {
      const result = await refetch();

      dataToExport = (result?.data || []) as typeof restocks;
    }
    if (!dataToExport || dataToExport.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    // Génération CSV (export complet, pas seulement les 10 affichés)
    const headers = [
      "date",
      "heure",
      "type",
      "notes",
      "slot_number",
      "product_name",
      "quantity_before",
      "quantity_after",
      "quantity_added",
    ];

    const escapeCsv = (val: unknown) => {
      const s = String(val ?? "");
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const rows: string[] = [];
    rows.push(headers.join(","));
    for (const r of dataToExport) {
      const d = new Date(r.created_at);
      const date = d.toLocaleDateString("fr-FR");
      const time = d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      for (const it of r.items) {
        const t = it.type ?? (it.quantity_added >= 0 ? "addition" : "removal");
        rows.push(
          [
            date,
            time,
            t,
            r.notes ?? "",
            it.slot_number,
            it.product_name,
            it.quantity_before,
            it.quantity_after,
            it.quantity_added,
          ]
            .map(escapeCsv)
            .join(",")
        );
      }
    }

    const csvContent = "\ufeff" + rows.join("\n"); // BOM pour Excel
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `restocks_${machineId}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card id="restock-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique des ravitaillements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showInitialButton && (
          <div className="flex items-center justify-center py-4">
            <Button variant="secondary" onClick={handleShow}>
              <History className="w-4 h-4 mr-2" /> Afficher l'historique
            </Button>
          </div>
        )}

        {showLoader && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Barre d'actions quand des données existent déjà */}
        {restocks && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Affichage: 10 derniers ravitaillements — l'export inclut tout
              l'historique
            </div>
            <div className="flex items-center gap-2">
              {/* Filtres type */}
              <Button
                variant={filterType === "all" ? "secondary" : "outline"}
                onClick={() => setFilterType("all")}
              >
                Tous
              </Button>
              <Button
                variant={filterType === "addition" ? "secondary" : "outline"}
                onClick={() => setFilterType("addition")}
              >
                Ajouts
              </Button>
              <Button
                variant={filterType === "removal" ? "secondary" : "outline"}
                onClick={() => setFilterType("removal")}
              >
                Retraits
              </Button>

              {/* Export & Refresh */}
              <Button
                variant="secondary"
                onClick={exportCsv}
                disabled={Boolean(isFetching)}
              >
                <History className="w-4 h-4 mr-2" /> Exporter tout l'historique
                (CSV)
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setRequested(true);
                  refetch();
                }}
                disabled={Boolean(isFetching)}
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Actualisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {requested && error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-3">Erreur: {error.message}</div>
            <Button variant="secondary" onClick={handleShow}>
              <RefreshCw className="w-4 h-4 mr-2" /> Réessayer
            </Button>
          </div>
        )}

        {requested &&
          !isFetching &&
          !error &&
          (!sortedLimited || sortedLimited.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun ravitaillement pour le moment.
            </div>
          )}

        {requested &&
          !isFetching &&
          !error &&
          sortedLimited &&
          sortedLimited.length > 0 && (
            <div className="space-y-6">
              {groupedByDate.map(({ date, entries }) => (
                <div key={date} className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    {date}
                  </div>
                  <div className="space-y-3">
                    {entries!.map((r) => (
                      <div key={r.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Heure:
                            </span>{" "}
                            {new Date(r.created_at).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                            {r.notes && (
                              <span className="text-muted-foreground">
                                {" "}
                                • {r.notes}
                              </span>
                            )}
                          </div>
                          <Badge variant="secondary">
                            {r.items.length} item{r.items.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          {r.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center gap-3 bg-muted/40 rounded-md p-2"
                            >
                              <div className="w-8 h-8 flex items-center justify-center rounded bg-white border">
                                <Package className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  Slot #{it.slot_number} • {it.product_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {/* Badge type */}
                                  <span
                                    className={
                                      (it.type ??
                                        (it.quantity_added >= 0
                                          ? "addition"
                                          : "removal")) === "addition"
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }
                                  >
                                    {(it.type ??
                                      (it.quantity_added >= 0
                                        ? "addition"
                                        : "removal")) === "addition"
                                      ? "+"
                                      : "-"}
                                  </span>{" "}
                                  {it.quantity_before} → {it.quantity_after} ({" "}
                                  {it.quantity_added > 0 ? "+" : ""}
                                  {it.quantity_added} )
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
