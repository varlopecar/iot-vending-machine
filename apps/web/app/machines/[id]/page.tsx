"use client";

import { useParams } from "next/navigation";
import { MachineDetail } from "@/components/machines";

export default function MachineDetailPage() {
  const params = useParams();
  const machineId = params.id as string;

  if (!machineId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">
          Erreur: ID de machine manquant
        </h1>
      </div>
    );
  }

  return <MachineDetail machineId={machineId} />;
}
