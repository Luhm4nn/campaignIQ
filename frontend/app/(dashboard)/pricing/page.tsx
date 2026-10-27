'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Infinity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      name: 'Starter',
      price: 0,
      description: 'Perfect for beginners exploring campaign analytics',
      features: [
        'Up to 3 active campaigns',
        'Basic analytics dashboard',
        'Monthly performance reports',
        'Email support',
        '30-day data retention',
      ],
      buttonText: 'Get Started',
    },
    {
      name: 'Pro',
      price: 49,
      description: 'For growing teams managing multiple campaigns',
      features: [
        'Unlimited active campaigns',
        'Advanced AI insights',
        'Real-time analytics',
        'Custom reports',
        'Competitor analysis',
        'Priority email support',
        '1-year data retention',
        'API access',
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
    },
    {
      name: 'Enterprise',
      price: 299,
      description: 'For large organizations with custom needs',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security',
        'SAML SSO',
        'Unlimited data retention',
        '24/7 phone support',
        'SLA guarantee',
      ],
      buttonText: 'Contact Sales',
    },
  ]);

  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  const handlePriceEdit = (planName: string, currentPrice: number) => {
    setEditingPrice(planName);
    setEditValues({ ...editValues, [planName]: currentPrice });
  };

  const handlePriceSave = (planName: string) => {
    const newPrice = editValues[planName];
    setPlans(
      plans.map((plan) =>
        plan.name === planName ? { ...plan, price: newPrice } : plan
      )
    );
    setEditingPrice(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative px-6 py-16 sm:px-12 lg:px-16 border-b border-border/50">
        <div className="absolute inset-0 opacity-30 gradient-mesh" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
              Flexible Plans
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Plans and Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your campaign analytics needs. Upgrade or downgrade anytime.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 py-16 sm:px-12 lg:px-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'glass glow-card rounded-2xl p-8 relative group transition-all duration-300',
                plan.popular && 'md:scale-105 ring-2 ring-primary'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-4 py-1.5 rounded-full bg-background border border-primary/50">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  {plan.name === 'Starter' && <Check className="h-5 w-5 text-success" />}
                  {plan.name === 'Pro' && <Crown className="h-5 w-5 text-primary" />}
                  {plan.name === 'Enterprise' && <Infinity className="h-5 w-5 text-accent" />}
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price Section */}
              <div className="mb-8 pb-8 border-b border-border/50">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-foreground">
                    ${editingPrice === plan.name ? (
                      <input
                        type="number"
                        value={editValues[plan.name]}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [plan.name]: parseInt(e.target.value),
                          })
                        }
                        className="w-20 bg-input border border-border rounded text-foreground px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      plan.price
                    )}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <button
                  onClick={() =>
                    editingPrice === plan.name
                      ? handlePriceSave(plan.name)
                      : handlePriceEdit(plan.name, plan.price)
                  }
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  {editingPrice === plan.name ? '✓ Save price' : '✎ Edit price'}
                </button>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className={cn(
                  'w-full py-3 rounded-lg font-semibold transition-all duration-300',
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, you get 14 days free on Pro and Enterprise plans with full feature access.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="glass rounded-lg p-6 border border-border/50"
              >
                <h4 className="font-semibold text-foreground mb-2">{item.q}</h4>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
