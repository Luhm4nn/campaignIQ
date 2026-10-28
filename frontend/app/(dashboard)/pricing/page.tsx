"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      name: "Starter",
      price: 0,
      description: "Essential tracking for individual creators and small tests",
      features: [
        "Up to 3 active campaigns",
        "Core analytics dashboard",
        "Monthly performance reports",
        "Standard email support",
        "30-day data retention",
      ],
      buttonText: "Current Plan",
    },
    {
      name: "Pro",
      price: 49,
      description: "Full analytical suite for growing marketing teams",
      features: [
        "Unlimited active campaigns",
        "VADER sentiment & optimal hour insights",
        "Real-time RapidAPI deep scraping",
        "CSV & PowerBI exports",
        "Competitor benchmark tracking",
        "Priority support",
        "1-year data retention",
      ],
      popular: true,
      buttonText: "Upgrade to Pro",
    },
    {
      name: "Enterprise",
      price: 299,
      description: "Custom scale, dedicated infrastructure, and SLA",
      features: [
        "Everything in Pro",
        "Dedicated account engineer",
        "Custom webhook integrations",
        "SAML SSO & audit logs",
        "Unlimited historical retention",
        "24/7 priority SLA guarantee",
      ],
      buttonText: "Contact Sales",
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
    <div className="space-y-8">
      <div className="pb-4 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Workspace Billing
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Plans & Pricing
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Transparent tiers for campaign telemetry, sentiment analysis, and API sync.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-xl border bg-card overflow-hidden flex flex-col justify-between glow-card",
              plan.popular
                ? "border-primary/60 ring-1 ring-primary/30"
                : "border-border"
            )}
          >
            <div>
              <div
                className={cn(
                  "h-1 w-full bg-gradient-to-r",
                  plan.popular
                    ? "from-primary via-accent to-primary"
                    : "from-border via-muted-foreground/30 to-border"
                )}
              />
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="text-[11px] font-medium text-white px-2.5 py-0.5 rounded-md btn-gradient">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground min-h-[32px]">
                  {plan.description}
                </p>

                <div className="my-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold text-foreground tabular-nums">
                      $
                      {editingPrice === plan.name ? (
                        <input
                          type="number"
                          value={editValues[plan.name]}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              [plan.name]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 bg-input border border-border rounded px-2 py-0.5 text-lg text-foreground"
                          autoFocus
                        />
                      ) : (
                        plan.price
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                  <button
                    onClick={() =>
                      editingPrice === plan.name
                        ? handlePriceSave(plan.name)
                        : handlePriceEdit(plan.name, plan.price)
                    }
                    className="mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {editingPrice === plan.name ? "Save price" : "Adjust price"}
                  </button>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                className={cn(
                  "w-full py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  plan.popular
                    ? "btn-gradient text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              q: "Can I change my plan anytime?",
              a: "Yes, you can upgrade or downgrade your workspace tier at any time with immediate effect.",
            },
            {
              q: "What payment methods are supported?",
              a: "All major credit cards and wire transfers for annual enterprise contracts.",
            },
            {
              q: "How does API quota work?",
              a: "You can connect your own RapidAPI key in Settings or use built-in public scrapers without limits.",
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="text-sm font-medium text-foreground">{item.q}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
