import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserPlan {
  id: string;
  plan_name: string;
  dashboard_limit: number;
}

interface DashboardStats {
  activeDashboards: number;
  dashboardLimit: number;
  availableDashboards: number;
  planName: string;
  canCreateMore: boolean;
}

export function useDashboardLimits() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeDashboards: 0,
    dashboardLimit: 50,
    availableDashboards: 50,
    planName: 'basic',
    canCreateMore: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get user plan
      const { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no plan exists, create one
      if (!planData) {
        const { data: newPlan } = await supabase
          .from('user_plans')
          .insert({
            user_id: user.id,
            plan_name: 'basic',
            dashboard_limit: 50
          })
          .select()
          .single();

        if (newPlan) {
          await fetchDashboardCount(newPlan);
        }
      } else {
        await fetchDashboardCount(planData);
      }
    } catch (error) {
      console.error('Error fetching dashboard limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardCount = async (plan: UserPlan) => {
    if (!user) return;

    const { count } = await supabase
      .from('dashboards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    const activeDashboards = count || 0;
    const availableDashboards = Math.max(0, plan.dashboard_limit - activeDashboards);
    const canCreateMore = activeDashboards < plan.dashboard_limit;

    setStats({
      activeDashboards,
      dashboardLimit: plan.dashboard_limit,
      availableDashboards,
      planName: plan.plan_name,
      canCreateMore,
    });
  };

  const checkCanCreate = (): { canCreate: boolean; message?: string } => {
    if (!stats.canCreateMore) {
      return {
        canCreate: false,
        message: `Você atingiu o limite de ${stats.dashboardLimit} dashboards. Faça upgrade do seu plano para criar mais.`
      };
    }
    return { canCreate: true };
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
    checkCanCreate,
  };
}