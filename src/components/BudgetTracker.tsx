import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Plus, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Sparkles,
  Calculator,
  Receipt,
  AlertTriangle
} from 'lucide-react';

const BudgetTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const totalBudget = 500000;
  const totalSpent = 255000;
  const remainingBudget = totalBudget - totalSpent;

  const budgetCategories = [
    { name: 'Venue', budget: 150000, spent: 120000, color: 'bg-pink-500', icon: '🏛️' },
    { name: 'Food & Catering', budget: 100000, spent: 85000, color: 'bg-orange-500', icon: '🍽️' },
    { name: 'Photography', budget: 50000, spent: 25000, color: 'bg-blue-500', icon: '📸' },
    { name: 'Decoration', budget: 80000, spent: 15000, color: 'bg-green-500', icon: '🌸' },
    { name: 'Attire & Jewelry', budget: 60000, spent: 10000, color: 'bg-purple-500', icon: '👗' },
    { name: 'Music & Entertainment', budget: 30000, spent: 0, color: 'bg-yellow-500', icon: '🎵' },
    { name: 'Transportation', budget: 20000, spent: 0, color: 'bg-indigo-500', icon: '🚗' },
    { name: 'Miscellaneous', budget: 10000, spent: 0, color: 'bg-gray-500', icon: '📝' },
  ];

  const recentExpenses = [
    { id: 1, description: 'Venue Booking Advance', amount: 50000, category: 'Venue', date: '2024-11-15', type: 'expense' },
    { id: 2, description: 'Wedding Lehenga', amount: 45000, category: 'Attire & Jewelry', date: '2024-11-10', type: 'expense' },
    { id: 3, description: 'Catering Advance', amount: 30000, category: 'Food & Catering', date: '2024-11-08', type: 'expense' },
    { id: 4, description: 'Photography Package', amount: 25000, category: 'Photography', date: '2024-11-05', type: 'expense' },
    { id: 5, description: 'Decoration Flowers', amount: 15000, category: 'Decoration', date: '2024-11-03', type: 'expense' },
  ];

  const AddExpenseDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hero-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for your wedding budget
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="e.g., Venue booking deposit" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" placeholder="Enter amount" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {budgetCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button className="hero-button">Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

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
            <div className="text-3xl font-bold mb-2">₹{totalBudget.toLocaleString('en-IN')}</div>
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
            <div className="text-3xl font-bold mb-2 text-warning">₹{totalSpent.toLocaleString('en-IN')}</div>
            <Progress value={(totalSpent / totalBudget) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">{Math.round((totalSpent / totalBudget) * 100)}% of budget used</p>
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
            <div className="text-3xl font-bold mb-2 text-success">₹{remainingBudget.toLocaleString('en-IN')}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.budget) * 100;
              const isOverBudget = category.spent > category.budget;
              
              return (
                <div key={category.name} className="p-4 rounded-lg border bg-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-sm">{category.name}</span>
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
                        ₹{category.budget.toLocaleString('en-IN')}
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
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="wedding-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Recent Expenses</span>
          </CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border bg-secondary/10">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{expense.description}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Expenses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Budget Suggestions */}
      <Card className="wedding-card border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span>AI Budget Insights</span>
          </CardTitle>
          <CardDescription>Smart recommendations for your wedding budget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Money Saved</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You're ₹65,000 under budget on decoration. Consider upgrading to premium flowers.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Budget Alert</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Venue costs are 80% of budget. Consider negotiating final payment terms.
              </p>
            </div>
          </div>
          
          <Button className="accent-button w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Get Detailed Budget Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;