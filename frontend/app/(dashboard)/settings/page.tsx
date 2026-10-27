"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  User,
  Mail,
  Building,
} from "lucide-react";
import {
  API_BASE_URL,
  getExportCsvUrl,
  fetchUsersApi,
  saveUserApi,
  useCampaignData,
} from "@/lib/api";

export default function SettingsPage() {
  const { isConnected } = useCampaignData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetchUsersApi()
      .then((users) => {
        if (users.length > 0) {
          setName(users[0].name);
          setEmail(users[0].email);
          setCompany(users[0].company || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setSavedMsg("Name and email are required");
      return;
    }
    try {
      await saveUserApi({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
      });
      setSavedMsg("Profile saved to database");
    } catch {
      setSavedMsg("Error saving profile");
    }
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Update your personal information in the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Display Name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel>Company</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Building className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Organization name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </InputGroup>
                </Field>
              </FieldGroup>
              <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
                {savedMsg && (
                  <span className="text-xs font-medium text-success">
                    {savedMsg}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Email Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive campaign updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Performance Alerts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when metrics change significantly
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance summaries
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">AI Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new AI recommendations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">API Configuration</CardTitle>
              </div>
              <CardDescription>
                Backend service endpoint and interactive documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Backend Endpoint
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      isConnected
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                    }
                  >
                    {isConnected ? "Connected (PostgreSQL)" : "Disconnected"}
                  </Badge>
                </div>
                <code className="text-xs text-muted-foreground">
                  {API_BASE_URL}
                </code>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`${API_BASE_URL}/docs`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Swagger API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <a href={getExportCsvUrl()} target="_blank" rel="noreferrer">
                  <Database className="h-4 w-4" />
                  Export Data (CSV)
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="h-4 w-4" />
                Security Settings
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">Pro</span>
                <Badge className="bg-primary text-primary-foreground">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Unlimited campaigns</p>
                <p>Advanced analytics</p>
                <p>AI-powered insights</p>
                <p>Priority support</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Supported Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Twitter", "Instagram", "LinkedIn", "Facebook", "TikTok"].map(
                (platform) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">{platform}</span>
                    <Badge
                      variant="secondary"
                      className="bg-success/20 text-success text-xs"
                    >
                      Enabled
                    </Badge>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
