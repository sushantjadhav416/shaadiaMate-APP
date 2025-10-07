import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BudgetItem {
  id: string;
  user_id: string;
  category: string;
  item_name: string;
  vendor?: string;
  estimated_cost?: number;
  actual_cost?: number;
  payment_date?: string;
  status: 'planned' | 'paid' | 'pending';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categoryBreakdown: {
    category: string;
    estimated: number;
    spent: number;
    remaining: number;
  }[];
}

export const useBudget = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all budget items
  const { data: budgetItems = [], isLoading, error } = useQuery({
    queryKey: ['budget-items'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BudgetItem[];
    },
  });

  // Calculate budget summary
  const budgetSummary: BudgetSummary = {
    totalBudget: budgetItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0),
    totalSpent: budgetItems.reduce((sum, item) => sum + (item.actual_cost || 0), 0),
    remaining: 0,
    categoryBreakdown: [],
  };
  budgetSummary.remaining = budgetSummary.totalBudget - budgetSummary.totalSpent;

  // Calculate category breakdown
  const categoryMap = new Map<string, { estimated: number; spent: number }>();
  budgetItems.forEach(item => {
    const existing = categoryMap.get(item.category) || { estimated: 0, spent: 0 };
    categoryMap.set(item.category, {
      estimated: existing.estimated + (item.estimated_cost || 0),
      spent: existing.spent + (item.actual_cost || 0),
    });
  });

  budgetSummary.categoryBreakdown = Array.from(categoryMap.entries()).map(([category, values]) => ({
    category,
    estimated: values.estimated,
    spent: values.spent,
    remaining: values.estimated - values.spent,
  }));

  // Create budget item
  const createBudgetItem = useMutation({
    mutationFn: async (newItem: Omit<BudgetItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budget_items')
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast({
        title: "Success",
        description: "Budget item added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update budget item
  const updateBudgetItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BudgetItem> }) => {
      const { data, error } = await supabase
        .from('budget_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast({
        title: "Success",
        description: "Budget item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete budget item
  const deleteBudgetItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast({
        title: "Success",
        description: "Budget item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    budgetItems,
    budgetSummary,
    isLoading,
    error,
    createBudgetItem: createBudgetItem.mutate,
    updateBudgetItem: updateBudgetItem.mutate,
    deleteBudgetItem: deleteBudgetItem.mutate,
    isCreating: createBudgetItem.isPending,
    isUpdating: updateBudgetItem.isPending,
    isDeleting: deleteBudgetItem.isPending,
  };
};
