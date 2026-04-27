"use client";

import { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiCheckCircle, FiLoader, FiPackage, FiPauseCircle } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Card, CardContent } from "@/components/ui/card";

type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  averagePrice: number;
};

const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalProducts: 0,
  activeProducts: 0,
  inactiveProducts: 0,
  averagePrice: 0,
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const overviewStats = useMemo(
    () => [
      {
        label: "Total Products",
        value: dashboardStats.totalProducts.toString(),
        icon: FiPackage,
      },
      {
        label: "Active Products",
        value: dashboardStats.activeProducts.toString(),
        icon: FiCheckCircle,
      },
      {
        label: "Inactive Products",
        value: dashboardStats.inactiveProducts.toString(),
        icon: FiPauseCircle,
      },
      {
        label: "Average Price",
        value: formatPrice(dashboardStats.averagePrice),
        icon: FiArrowUpRight,
      },
    ],
    [dashboardStats],
  );

  useEffect(() => {
    let mounted = true;

    async function loadDashboardStats() {
      try {
        setIsLoading(true);

        const response = await apiClient.get<{
          data?: DashboardStats;
        }>("/admin/dashboard");

        if (!mounted) {
          return;
        }

        setDashboardStats(response.data.data ?? INITIAL_DASHBOARD_STATS);
      } catch (error) {
        if (mounted) {
          toast.error(getApiErrorMessage(error, "Failed to load dashboard stats."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Pick an area below to continue managing GameOrbit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} className="border-border/80">
              <CardContent className="flex items-center justify-between gap-3 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {isLoading ? <FiLoader className="size-5 animate-spin text-muted-foreground" aria-hidden="true" /> : stat.value}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
