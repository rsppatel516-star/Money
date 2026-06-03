/* eslint-disable */
/**
 * AI Spending Insights & Patterns Engine
 * Analyzes transactions, budgets, goals, and profiles to generate actionable insights.
 */

export const aiService = {
  generateInsights(transactions, budgets, goals, settings) {
    const insights = [];
    const currencySym = settings?.currency === 'INR' ? '₹' : settings?.currency === 'USD' ? '$' : '€';
    
    // 1. Separate income vs expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalIncomes = incomes.reduce((acc, t) => acc + Number(t.amount), 0);
    
    if (transactions.length === 0) {
      insights.push({
        id: 'no_data',
        type: 'info',
        title: 'Ready to flow',
        message: 'Add your first income or expense transaction to unlock personalized AI-powered insights.',
        impact: 'Get Started'
      });
      return insights;
    }

    // 2. Spending Rate check
    if (totalIncomes > 0) {
      const burnRate = (totalExpenses / totalIncomes) * 100;
      const savingsRate = 100 - burnRate;
      
      if (burnRate > 90) {
        insights.push({
          id: 'high_burn',
          type: 'warning',
          title: 'High Burn Rate Detected',
          message: `You are spending ${burnRate.toFixed(0)}% of your income. Consider reviewing non-essential categories to build a safer cushion.`,
          impact: 'Critical'
        });
      } else if (savingsRate >= 20) {
        insights.push({
          id: 'healthy_savings',
          type: 'success',
          title: 'Strong Savings Habit!',
          message: `Great job! You are saving ${savingsRate.toFixed(0)}% of your monthly income, exceeding the standard 20% healthy threshold.`,
          impact: `+${savingsRate.toFixed(0)}% Savings`
        });
      }
    }

    // 3. Category analysis and budget overrun checking
    const categorySpending = {};
    expenses.forEach(tx => {
      const cat = tx.category || 'Other';
      categorySpending[cat] = (categorySpending[cat] || 0) + Number(tx.amount);
    });

    Object.keys(categorySpending).forEach(cat => {
      const spent = categorySpending[cat];
      const limit = budgets[cat];
      
      if (limit) {
        const percent = (spent / limit) * 100;
        if (percent >= 100) {
          insights.push({
            id: `budget_over_${cat}`,
            type: 'warning',
            title: `Budget Blown: ${cat}`,
            message: `You have exceeded your ${cat} budget of ${currencySym}${limit} by spending ${currencySym}${spent.toFixed(0)}.`,
            impact: `Overspent by ${currencySym}${(spent - limit).toFixed(0)}`
          });
        } else if (percent >= 80) {
          insights.push({
            id: `budget_warn_${cat}`,
            type: 'tip',
            title: `Nearing ${cat} Budget Limit`,
            message: `You've spent ${percent.toFixed(0)}% (${currencySym}${spent.toFixed(0)} of ${currencySym}${limit}) for ${cat}. Suggest pausing shopping in this category.`,
            impact: `${currencySym}${(limit - spent).toFixed(0)} remaining`
          });
        }
      } else if (spent > totalExpenses * 0.25) {
        // Spent more than 25% of total expenses in a category without a budget
        insights.push({
          id: `suggest_budget_${cat}`,
          type: 'info',
          title: `Budget Suggestion: ${cat}`,
          message: `${cat} represents ${(spent / totalExpenses * 100).toFixed(0)}% of your overall monthly expenses. Consider setting a budget limit.`,
          impact: `Optimize ${cat}`
        });
      }
    });

    // 4. Large recent single purchases
    const largeTx = expenses.find(tx => Number(tx.amount) > (totalIncomes * 0.15));
    if (largeTx && totalIncomes > 0) {
      insights.push({
        id: 'large_tx',
        type: 'tip',
        title: 'Significant Single Transaction',
        message: `Your transaction of ${currencySym}${Number(largeTx.amount).toLocaleString()} for "${largeTx.note || largeTx.category}" represented over 15% of your income.`,
        impact: 'Audit item'
      });
    }

    // 5. Savings Goals Progress boost
    const activeGoals = goals.filter(g => g.saved < g.target);
    if (activeGoals.length > 0 && totalIncomes > totalExpenses) {
      const netSavings = totalIncomes - totalExpenses;
      insights.push({
        id: 'distribute_savings',
        type: 'success',
        title: 'Available Funds to Invest',
        message: `You have ${currencySym}${netSavings.toLocaleString()} in unallocated monthly savings. Allocate it to your active goals to reach them faster.`,
        impact: 'Accelerate Goals'
      });
    }

    // 6. Predict next month's spend (Basic Linear Regression Projection helper)
    if (expenses.length >= 3) {
      // Group by week or just estimate based on days elapsed
      const dates = expenses.map(t => new Date(t.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
      
      const burnRatePerDay = totalExpenses / daysDiff;
      const expectedMonthlySpend = burnRatePerDay * 30;
      
      if (totalIncomes > 0 && expectedMonthlySpend > totalIncomes) {
        insights.push({
          id: 'spend_forecast_danger',
          type: 'warning',
          title: 'Projected Overdraft Warning',
          message: `At your current rate, you are on track to spend ${currencySym}${expectedMonthlySpend.toFixed(0)} by the end of 30 days, which exceeds your monthly income.`,
          impact: `Risk of overdraft`
        });
      } else if (totalIncomes > 0 && expectedMonthlySpend < totalIncomes * 0.7) {
        insights.push({
          id: 'spend_forecast_great',
          type: 'success',
          title: 'On Track for Budget Surplus',
          message: `Your current spending trajectory projects a monthly total of ${currencySym}${expectedMonthlySpend.toFixed(0)}, leaving a strong cash surplus.`,
          impact: `Forecast surplus`
        });
      }
    }

    // Sort: warnings first, then tips, success, info
    const priority = { warning: 0, tip: 1, success: 2, info: 3 };
    return insights.sort((a, b) => priority[a.type] - priority[b.type]);
  }
};
