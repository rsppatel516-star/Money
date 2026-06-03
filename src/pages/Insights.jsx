/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { BiBot, BiSend, BiMessageSquareDetail, BiTrendingUp, BiChevronRight } from 'react-icons/bi';


export default function Insights() {
  const { user } = useAuth();
  const { 
    transactions, 
    budgets, 
    goals, 
    subscriptions, 
    debts, 
    income, 
    expenses, 
    balance, 
    settings 
  } = useFinance();

  const chatEndRef = useRef(null);

  // Initial greeting
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.displayName || 'there'}! I'm your MoneyFlow AI Coach. I've analyzed your financial data. What would you like to review today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings?.currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (prompt) => {
    const p = prompt.toLowerCase();

    // 1. Budget Cuts check
    if (p.includes('budget') || p.includes('cut') || p.includes('spend')) {
      const budgetList = Object.entries(budgets);
      if (budgetList.length === 0) {
        return "You haven't set any monthly budgets yet! Head over to the Budget Planner to assign category limits first.";
      }
      
      // Analyze category spending
      let recommendations = [];
      budgetList.forEach(([cat, limit]) => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === cat)
          .reduce((acc, t) => acc + Number(t.amount), 0);
        const ratio = spent / limit;
        
        if (ratio >= 0.8) {
          recommendations.push(`Your **${cat}** spending is at **${Math.round(ratio * 100)}%** of your limit (${formatCurrency(spent)} / ${formatCurrency(limit)}). Consider postponing luxury ${cat} expenses for the rest of the month.`);
        } else if (ratio >= 0.5) {
          recommendations.push(`Your **${cat}** spending is at **${Math.round(ratio * 100)}%** (${formatCurrency(spent)}). You are on track, but keep an eye on card swipe frequencies!`);
        }
      });

      if (recommendations.length === 0) {
        return "Excellent job! All of your category expenditures are currently under 50% of your allocated monthly budgets. Your pocket looks healthy!";
      }

      return `Here is my budget analysis:\n\n` + recommendations.join('\n\n');
    }

    // 2. Subscriptions check
    if (p.includes('sub') || p.includes('bill') || p.includes('recurring')) {
      if (subscriptions.length === 0) {
        return "You have no recurring subscriptions registered in the tracking sheet. Try adding some bills to analyze regular outflows.";
      }

      const totalMonthly = subscriptions.reduce((sum, sub) => {
        const val = Number(sub.amount) || 0;
        return sum + (sub.billingCycle === 'yearly' ? val / 12 : val);
      }, 0);

      return `You currently have **${subscriptions.length} active subscriptions** costing you **${formatCurrency(totalMonthly)}** per month. Let's take a look:\n\n` +
        subscriptions.map(s => `- **${s.name}**: ${formatCurrency(s.amount)} (${s.billingCycle})`).join('\n') +
        `\n\n💡 *Tip: Consider audit reviews of streaming plans you haven't watched in the last 30 days.*`;
    }

    // 3. Savings evaluation
    if (p.includes('save') || p.includes('goal') || p.includes('laptop') || p.includes('vacation')) {
      if (goals.length === 0) {
        return "You haven't defined any Savings Goals yet! Set up targets under the Savings Goals page to plan future purchases.";
      }

      let summary = goals.map(g => {
        const pct = Math.round((g.saved / g.target) * 100);
        return `- **${g.name}**: ${pct}% complete (${formatCurrency(g.saved)} saved of ${formatCurrency(g.target)}).`;
      }).join('\n');

      return `Here is your Savings Progress:\n\n${summary}\n\n💡 *Tip: Setting up automatic transfers matching your goal amounts at the beginning of each month yields a 4x success multiplier!*`;
    }

    // 4. Default general savings tip
    const generalTips = [
      `Try the **50/30/20 Rule**: Allocate 50% of your income (${formatCurrency(income * 0.5)}) to Needs, 30% (${formatCurrency(income * 0.3)}) to Wants, and save 20% (${formatCurrency(income * 0.2)}) systematically.`,
      "Your current outstanding debt principal stands at " + formatCurrency(debts.reduce((sum, d) => sum + (d.amount - d.repaid), 0)) + ". Focus on paying off high-interest balances (like credit card EMIs) first.",
      `You've logged ${transactions.length} total transactions. Consistent logging leads to better subconscious spending self-control!`,
      "Build an Emergency Fund of 6 months' expenses. Based on your current transaction history, your monthly average expense is " + formatCurrency(expenses) + ". Your emergency fund target should be approximately " + formatCurrency(expenses * 6) + "."
    ];

    // eslint-disable-next-line react-hooks/purity
    return generalTips[Math.floor(Math.random() * generalTips.length)];
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI typing delay
    setTimeout(() => {
      const responseText = getAIResponse(text);
      const aiMsg = {
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const presetQueries = [
    { label: 'Suggest Budget Cuts', query: 'Suggest Budget Cuts' },
    { label: 'Evaluate Savings Goals', query: 'Evaluate Savings Goals' },
    { label: 'Check Recurring Subscriptions', query: 'Check Subscriptions' },
    { label: 'General Savings Tip', query: 'General Savings Tip' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns - Automatic Insights Summary */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-heading">
            AI Financial Insights
          </h2>
          <p className="text-slate-500 text-sm">
            Automated recommendations based on real-time balance calculations.
          </p>
        </div>

        {/* Dynamic Alerts */}
        <div className="space-y-4">
          {/* Ratio Alert */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-brand-600 mb-2">
              <BiMessageSquareDetail className="text-xl" />
              <h4 className="font-bold text-sm font-heading">Savings Ratio Status</h4>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              {income > 0 ? (
                expenses / income > 0.8 ? (
                  `⚠️ Warning: You are spending ${Math.round((expenses / income) * 100)}% of your income. We recommend cutting down non-essential items.`
                ) : (
                  `🎉 Great job! You are saving ${Math.round((1 - expenses / income) * 100)}% of your total earnings this month.`
                )
              ) : (
                "Log your salary or monthly deposits to get calculations on your savings savings ratio."
              )}
            </p>
          </div>

          {/* Subscriptions alert */}
          {subscriptions.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 text-violet-600 mb-2">
                <BiMessageSquareDetail className="text-xl" />
                <h4 className="font-bold text-sm font-heading">Monthly Bill Projections</h4>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                You have {subscriptions.length} recurring billing systems. Total projected monthly recurring expense is{' '}
                <strong className="text-violet-600">
                  {formatCurrency(subscriptions.reduce((sum, s) => sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount), 0))}
                </strong>
                . Ensure these plans are fully utilized.
              </p>
            </div>
          )}

          {/* Debt EMI Alert */}
          {debts.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 text-rose-600 mb-2">
                <BiTrendingUp className="text-xl" />
                <h4 className="font-bold text-sm font-heading">Active EMI Obligations</h4>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Your monthly EMI payments total{' '}
                <strong className="text-rose-600">
                  {formatCurrency(debts.reduce((sum, d) => sum + d.emi, 0))}
                </strong>
                . Settle outstanding principal balances systematically to avoid compounding interest costs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Columns - Interactive Chatbot */}
      <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl flex flex-col h-[650px] shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-brand-50 to-violet-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
              <BiBot className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-heading flex items-center gap-1.5">
                Financial Advisor Coach
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Powered by live ledger records</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <BiBot className="text-lg" />
                </div>
              )}
              <div className="space-y-1">
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white border-brand-500 rounded-tr-none'
                      : 'bg-white text-slate-700 border-slate-200/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className={`block text-[9px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <BiBot className="text-lg" />
              </div>
              <div className="bg-white border border-slate-200/60 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preset suggestions */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/20 flex flex-wrap gap-2">
          {presetQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              className="text-xs bg-white hover:bg-brand-50 hover:text-brand-600 border border-slate-200 hover:border-brand-200 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-0.5 shadow-sm"
            >
              {item.label}
              <BiChevronRight className="text-sm" />
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-slate-100 bg-white flex gap-3 items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your AI Coach (e.g. Suggest budget cuts)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10 hover:shadow-lg transition-all"
          >
            <BiSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}
