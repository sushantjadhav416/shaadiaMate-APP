import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Plus, 
  PieChart, 
  Sparkles,
  Calculator,
  Receipt,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useBudget, BudgetItem } from '@/hooks/useBudget';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_ICONS: Record<string, string> = {
  'Venue': '🏛️',
  'Food & Catering': '🍽️',
  'Photography': '📸',
  'Decoration': '🌸',
  'Attire & Jewelry': '👗',
  'Music & Entertainment': '🎵',
  'Transportation': '🚗',
  'Miscellaneous': '📝',
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

const BudgetTracker = () => {
  const { budgetItems, budgetSummary, isLoading, createBudgetItem, updateBudgetItem, deleteBudgetItem, isCreating, isUpdating, isDeleting } = useBudget();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    estimated_cost: '',
    actual_cost: '',
    vendor: '',
    payment_date: '',
    status: 'planned' as 'planned' | 'paid' | 'pending',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateBudgetItem({
        id: editingItem.id,
        updates: {
          item_name: formData.item_name,
          category: formData.category,
          estimated_cost: parseFloat(formData.estimated_cost) || 0,
          actual_cost: parseFloat(formData.actual_cost) || 0,
          vendor: formData.vendor || undefined,
          payment_date: formData.payment_date || undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        }
      });
    } else {
      createBudgetItem({
        item_name: formData.item_name,
        category: formData.category,
        estimated_cost: parseFloat(formData.estimated_cost) || 0,
        actual_cost: parseFloat(formData.actual_cost) || 0,
        vendor: formData.vendor || undefined,
        payment_date: formData.payment_date || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      });
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      item_name: '',
      category: '',
      estimated_cost: '',
      actual_cost: '',
      vendor: '',
      payment_date: '',
      status: 'planned',
      notes: '',
    });
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      estimated_cost: item.estimated_cost?.toString() || '',
      actual_cost: item.actual_cost?.toString() || '',
      vendor: item.vendor || '',
      payment_date: item.payment_date ? new Date(item.payment_date).toISOString().split('T')[0] : '',
      status: item.status,
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const AddExpenseDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) setEditingItem(null);
    }}>
      <DialogTrigger asChild>
        <Button className="hero-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update your expense details' : 'Record a new expense for your wedding budget'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input 
                id="item_name" 
                placeholder="e.g., Venue booking deposit" 
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          <span>{CATEGORY_ICONS[category]}</span>
                          <span>{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost (₹)</Label>
                <Input 
                  id="estimated_cost" 
                  type="number" 
                  placeholder="0" 
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost (₹)</Label>
                <Input 
                  id="actual_cost" 
                  type="number" 
                  placeholder="0" 
                  value={formData.actual_cost}
                  onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input 
                  id="vendor" 
                  placeholder="Vendor name" 
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input 
                  id="payment_date" 
                  type="date" 
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                placeholder="Additional notes" 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setEditingItem(null);
            }}>Cancel</Button>
            <Button type="submit" className="hero-button" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-8" style={{ background: 'var(--gradient-soft)' }}>
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ background: 'var(--gradient-soft)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            Budget Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Keep your wedding expenses on track
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Button variant="outline" className="accent-button">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Budget Optimizer
          </Button>
          <AddExpenseDialog />
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="wedding-card animate-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              <span>Total Budget</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">₹{budgetSummary.totalBudget.toLocaleString('en-IN')}</div>
            <p className="text-sm text-muted-foreground">Allocated for wedding</p>
          </CardContent>
        </Card>

        <Card className="wedding-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Receipt className="h-5 w-5 text-warning" />
              <span>Total Spent</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 text-warning">₹{budgetSummary.totalSpent.toLocaleString('en-IN')}</div>
            <Progress value={budgetSummary.totalBudget > 0 ? (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100 : 0} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {budgetSummary.totalBudget > 0 ? Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100) : 0}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card className="wedding-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <DollarSign className="h-5 w-5 text-success" />
              <span>Remaining</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 text-success">₹{budgetSummary.remaining.toLocaleString('en-IN')}</div>
            <p className="text-sm text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card className="wedding-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Budget Breakdown</span>
          </CardTitle>
          <CardDescription>Track spending across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetSummary.categoryBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No budget items yet. Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {budgetSummary.categoryBreakdown.map((category) => {
                const percentage = category.estimated > 0 ? (category.spent / category.estimated) * 100 : 0;
                const isOverBudget = category.spent > category.estimated;
                
                return (
                  <div key={category.category} className="p-4 rounded-lg border bg-secondary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{CATEGORY_ICONS[category.category] || '📝'}</span>
                        <span className="font-medium text-sm">{category.category}</span>
                      </div>
                      {isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs">
                        <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          ₹{category.spent.toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted-foreground">
                          ₹{category.estimated.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-center">
                        <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {Math.round(percentage)}% used
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="wedding-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>All Expenses</span>
          </CardTitle>
          <CardDescription>Your wedding budget items</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded yet. Click "Add Expense" to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <span className="text-xl">{CATEGORY_ICONS[item.category] || '📝'}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{item.item_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{item.category}</span>
                        {item.vendor && (
                          <>
                            <span>•</span>
                            <span>{item.vendor}</span>
                          </>
                        )}
                        {item.payment_date && (
                          <>
                            <span>•</span>
                            <span>{new Date(item.payment_date).toLocaleDateString('en-IN')}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'paid' ? 'bg-success/20 text-success' :
                          item.status === 'pending' ? 'bg-warning/20 text-warning' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      {item.actual_cost && item.actual_cost > 0 ? (
                        <>
                          <div className="text-lg font-semibold">
                            ₹{item.actual_cost.toLocaleString('en-IN')}
                          </div>
                          {item.estimated_cost && item.estimated_cost > 0 && (
                            <div className="text-xs text-muted-foreground line-through">
                              ₹{item.estimated_cost.toLocaleString('en-IN')}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-lg font-semibold">
                          ₹{(item.estimated_cost || 0).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        disabled={isUpdating || isDeleting}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteBudgetItem(item.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;