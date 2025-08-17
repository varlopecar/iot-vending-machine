"use client";

import { OverviewCards } from "./overview-cards";
import { MachineStatus } from "./machine-status";
import { AlertsWidget } from "./alerts-widget";

export function Dashboard() {
  return (
    <main
      className="space-y-8 min-w-0 overflow-hidden"
      role="main"
      aria-labelledby="dashboard-title"
    >
      {/* Header */}
      <header>
        <h2
          id="dashboard-title"
          className="text-3xl font-bold text-light-text dark:text-dark-text"
        >
          Dashboard
        </h2>
        <p className="text-base text-light-textSecondary dark:text-dark-textSecondary mt-2">
          Vue d'ensemble de votre plateforme de distributeurs automatiques
        </p>
      </header>

      {/* Overview Cards */}
      <section aria-labelledby="overview-title">
        <h3 id="overview-title" className="sr-only">
          Vue d'ensemble des métriques
        </h3>
        <OverviewCards />
      </section>

      {/* Second Row - Machine Status and Alerts */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0 overflow-hidden"
        aria-labelledby="status-title"
      >
        <h3 id="status-title" className="sr-only">
          État des machines et alertes
        </h3>
        <MachineStatus />
        <AlertsWidget />
      </section>
    </main>
  );
}
