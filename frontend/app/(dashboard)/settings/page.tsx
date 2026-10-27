"use client";

import { useState, useEffect, useCallback } from "react";
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
  Database,
  Key,
  User,
  Mail,
  Building,
  Lock,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Unplug,
  ChevronDown,
  ChevronUp,
  Instagram,
  Twitter,
  AlertTriangle,
  Zap,
  Globe,
} from "lucide-react";
import {
  API_BASE_URL,
  getExportCsvUrl,
  fetchUsersApi,
  saveUserApi,
  fetchIntegrationsApi,
  saveIntegrationCredentialsApi,
  testIntegrationConnectionApi,
  syncIntegrationPostsApi,
  disconnectIntegrationApi,
  useCampaignData,
} from "@/lib/api";
import type { IntegrationConfigRead } from "@/lib/types";

const DEFAULT_HOSTS: Record<string, string> = {
  instagram: "instagram-scraper-api2.p.rapidapi.com",
  tiktok: "tiktok-scraper7.p.rapidapi.com",
  twitter: "twitter-api45.p.rapidapi.com",
  meta_graph: "graph.facebook.com",
};

export default function SettingsPage() {
  const { isConnected, campaigns, refresh: refreshDashboard } = useCampaignData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationConfigRead[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("instagram");
  const [rapidApiKeyInput, setRapidApiKeyInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [rapidHostInput, setRapidHostInput] = useState(
    DEFAULT_HOSTS.instagram
  );
  const [selectedSyncCampaignId, setSelectedSyncCampaignId] =
    useState<string>("auto");

  const [guideOpen, setGuideOpen] = useState<boolean>(true);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const list = await fetchIntegrationsApi();
      setIntegrations(list);
      const current =
        list.find((i) => i.provider === selectedProvider) || list[0];
      if (current) {
        setUsernameInput(current.externalAccountName || "");
        setRapidHostInput(
          current.externalAccountId ||
            DEFAULT_HOSTS[current.provider] ||
            ""
        );
      }
    } catch {
      // Backend might be offline initially
    }
  }, [selectedProvider]);

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
    loadIntegrations();
  }, [loadIntegrations]);

  const activeIntegration = integrations.find(
    (i) => i.provider === selectedProvider
  ) || {
    id: 0,
    provider: selectedProvider,
    displayName: "Instagram (RapidAPI & Deep Scraper)",
    hasClientId: false,
    hasClientSecret: false,
    hasAccessToken: false,
    clientIdMasked: "",
    clientSecretMasked: "",
    accessTokenMasked: "",
    clientIdHash: "",
    externalAccountId: DEFAULT_HOSTS[selectedProvider] || "",
    externalAccountName: "",
    status: "disconnected",
    lastSyncAt: null,
    oauthCallbackUrl: "",
  };

  const handleProviderSelect = (providerKey: string) => {
    setSelectedProvider(providerKey);
    setRapidApiKeyInput("");
    const found = integrations.find((i) => i.provider === providerKey);
    setUsernameInput(found?.externalAccountName || "");
    setRapidHostInput(
      found?.externalAccountId || DEFAULT_HOSTS[providerKey] || ""
    );
    setStatusFeedback(null);
  };

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

  const handleSaveVaultCredentials = async () => {
    try {
      setBusyAction("save");
      setStatusFeedback(null);
      const updated = await saveIntegrationCredentialsApi(selectedProvider, {
        accessToken: rapidApiKeyInput.trim() || undefined,
        externalAccountName: usernameInput.trim(),
        externalAccountId:
          rapidHostInput.trim() || DEFAULT_HOSTS[selectedProvider],
      });
      setRapidApiKeyInput("");
      await loadIntegrations();
      setStatusFeedback({
        type: "success",
        text: `Configuración de ${updated.displayName} guardada y cifrada en PostgreSQL (Cuenta objetivo: ${
          updated.externalAccountName || "Sin definir"
        }).`,
      });
    } catch (err) {
      setStatusFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Error al guardar credenciales en la bóveda",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleTestConnection = async () => {
    try {
      setBusyAction("test");
      setStatusFeedback(null);
      if (usernameInput.trim() || rapidApiKeyInput.trim()) {
        await saveIntegrationCredentialsApi(selectedProvider, {
          accessToken: rapidApiKeyInput.trim() || undefined,
          externalAccountName: usernameInput.trim(),
          externalAccountId:
            rapidHostInput.trim() || DEFAULT_HOSTS[selectedProvider],
        });
        setRapidApiKeyInput("");
      }
      const res = await testIntegrationConnectionApi(selectedProvider);
      await loadIntegrations();
      setStatusFeedback({
        type: res.ok ? "success" : "error",
        text: res.message,
      });
    } catch (err) {
      setStatusFeedback({
        type: "error",
        text:
          err instanceof Error ? err.message : "Error al verificar la conexión",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSyncPosts = async () => {
    try {
      setBusyAction("sync");
      setStatusFeedback(null);
      if (usernameInput.trim() || rapidApiKeyInput.trim()) {
        await saveIntegrationCredentialsApi(selectedProvider, {
          accessToken: rapidApiKeyInput.trim() || undefined,
          externalAccountName: usernameInput.trim(),
          externalAccountId:
            rapidHostInput.trim() || DEFAULT_HOSTS[selectedProvider],
        });
        setRapidApiKeyInput("");
      }
      const campaignIdNum =
        selectedSyncCampaignId !== "auto"
          ? Number(selectedSyncCampaignId)
          : undefined;
      const res = await syncIntegrationPostsApi(selectedProvider, {
        campaignId: campaignIdNum,
      });
      await loadIntegrations();
      await refreshDashboard();
      setStatusFeedback({
        type: "success",
        text: res.message,
      });
    } catch (err) {
      setStatusFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Error al extraer publicaciones en vivo",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      setBusyAction("disconnect");
      await disconnectIntegrationApi(selectedProvider);
      setUsernameInput("");
      await loadIntegrations();
      setStatusFeedback({
        type: "info",
        text: "Clave y cuenta objetivo desconectadas de la bóveda.",
      });
    } catch {
      setStatusFeedback({
        type: "error",
        text: "Error al desconectar integración",
      });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings &amp; Deep Social Scraper Vault (RapidAPI)
        </h1>
        <p className="text-muted-foreground">
          Extrae métricas profundas en tiempo real de <b>Instagram</b>, <b>TikTok</b> y <b>Twitter / X</b> usando una única <code>X-RapidAPI-Key</code> (o scraper público directo) con cifrado en PostgreSQL y trazabilidad por <code>external_id</code>.
        </p>
      </div>

      {/* BÓVEDA DE EXTRACCIÓN PROFUNDA (INSTAGRAM, TIKTOK, TWITTER) */}
      <Card className="border-primary/30 bg-card shadow-lg">
        <CardHeader className="border-b border-border/40 bg-primary/5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Motor de Extracción Profunda (Instagram, TikTok &amp; Twitter/X)
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                    RapidAPI + Deep Scraper
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Una sola clave de RapidAPI sirve para todas las redes (se comparte y cifra automáticamente en PostgreSQL). ¡En TikTok y Twitter también funciona sin clave!
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGuideOpen(!guideOpen)}
                className="gap-1.5"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                {guideOpen ? "Ocultar Guía RapidAPI" : "Ver Guía de 30 Segundos"}
                {guideOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Selector de Red Social */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(integrations.length > 0
              ? integrations
              : [activeIntegration]
            ).map((item) => {
              const isSelected = item.provider === selectedProvider;
              const isConn = item.status === "connected";
              return (
                <button
                  key={item.provider}
                  type="button"
                  onClick={() => handleProviderSelect(item.provider)}
                  className={`flex flex-col items-start justify-between p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/50 bg-secondary/30 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {item.provider.replace("_", " ")}
                    </span>
                    <Badge
                      variant="secondary"
                      className={
                        isConn
                          ? "bg-success/20 text-success text-[10px]"
                          : "bg-muted text-muted-foreground text-[10px]"
                      }
                    >
                      {isConn ? "Listo" : "Sin Configurar"}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {item.displayName}
                  </p>
                  {item.externalAccountName && (
                    <p className="text-xs text-primary mt-1 truncate w-full font-mono">
                      {item.externalAccountName}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* GUÍA DE 30 SEGUNDOS PARA RAPIDAPI + DEEP SCRAPER */}
          {guideOpen && (
            <div className="rounded-2xl border border-primary/30 bg-secondary/20 p-5 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Guía Rápida (30 segundos): Cómo extraer métricas reales de Instagram, TikTok y Twitter/X
                </h3>
                <a
                  href="https://rapidapi.com/hub"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Abrir RapidAPI Hub (Login con Google en 1 clic)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid gap-4 md:grid-cols-3 text-xs text-muted-foreground">
                <div className="rounded-xl border border-primary/40 bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      1. TikTok y Twitter/X (¡Funciona SIN API Key!)
                    </span>
                    <Badge className="bg-success/20 text-success text-[10px]">
                      0 Claves
                    </Badge>
                  </div>
                  <p className="leading-relaxed">
                    Selecciona la pestaña <b>TikTok</b> o <b>Twitter / X</b> arriba, escribe cualquier <code>@usuario</code> real en el campo <b>&ldquo;@Usuario Objetivo&rdquo;</b> (ej: <code>@tiktok</code>, <code>@netflix</code>, <code>@vercel</code>, <code>@elonmusk</code> o tu propia cuenta) y haz clic directo en <b>&ldquo;Extraer Publicaciones y Métricas Ahora&rdquo;</b>. El scraper profundo trae vistas, likes, comentarios, guardados y compartidos reales al instante.
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Instagram className="h-3.5 w-3.5 text-pink-500" />
                    2. Instagram (Con X-RapidAPI-Key en 30 seg)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                    <li>
                      Entra a{" "}
                      <a
                        href="https://rapidapi.com/rockapis-rockapis-default/api/instagram-scraper-api2"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline font-medium"
                      >
                        Instagram Scraper API2 en RapidAPI
                      </a>{" "}
                      con tu cuenta de Google y toca <b>Subscribe to Test (Plan Basic $0/mes)</b>.
                    </li>
                    <li>
                      Copia el valor de <code>x-rapidapi-key</code> que aparece en el código de ejemplo.
                    </li>
                    <li>
                      Pégalo abajo en <b>X-RapidAPI-Key</b>: se cifra en PostgreSQL y sirve automáticamente para Instagram, TikTok y Twitter.
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5 text-sky-400" />
                    3. Qué métricas profundas extrae
                  </div>
                  <p className="leading-relaxed">
                    Por cada post/reel/video/tweet obtiene:
                    <br />• <b>Likes, Comentarios, Reposts/Shares y Guardados (Saves)</b> reales.
                    <br />• <b>Reproducciones (`play_count` / `views`) y Alcance (`reach`)</b> reales.
                    <br />• <b>Seguidores actuales</b> del perfil para medir el crecimiento (`growth`).
                    <br />• <b>Sentimiento VADER</b> + actualización por <code>external_id</code> sin duplicar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {statusFeedback && (
            <div
              className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
                statusFeedback.type === "success"
                  ? "bg-success/15 border-success/30 text-success"
                  : statusFeedback.type === "error"
                  ? "bg-destructive/15 border-destructive/30 text-destructive"
                  : "bg-primary/15 border-primary/30 text-primary"
              }`}
            >
              {statusFeedback.type === "error" ? (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              <span>{statusFeedback.text}</span>
            </div>
          )}

          {/* FORMULARIO PRINCIPAL DE CONFIGURACIÓN Y EXTRACCIÓN */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-border/50 bg-secondary/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    1. Cuenta Objetivo y Clave RapidAPI (Bóveda Cifrada)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Puedes scrapear cualquier cuenta pública ingresando solo su <code>@usuario</code>.
                  </p>
                </div>
                {activeIntegration.clientIdHash && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Blind Index: {activeIntegration.clientIdHash.slice(0, 10)}…
                  </Badge>
                )}
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel className="font-semibold text-primary">
                    @Usuario Objetivo a Scrapear ({selectedProvider.toUpperCase()})
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder={
                        selectedProvider === "tiktok"
                          ? "Ej: @tiktok, @netflix, @fcbarcelona o tu usuario"
                          : selectedProvider === "twitter"
                          ? "Ej: @vercel, @openai, @nasa o tu usuario"
                          : "Ej: @nike, @mercadolibre o tu usuario de Instagram"
                      }
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel className="flex items-center justify-between">
                    <span>
                      X-RapidAPI-Key (Opcional en TikTok/Twitter, Recomendada en Instagram)
                    </span>
                    {activeIntegration.hasAccessToken && (
                      <span className="text-xs text-success font-mono">
                        Cifrada: {activeIntegration.accessTokenMasked}
                      </span>
                    )}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      type="password"
                      placeholder={
                        activeIntegration.hasAccessToken
                          ? `${activeIntegration.accessTokenMasked} (Ya guardada en bóveda)`
                          : "Pega tu X-RapidAPI-Key (se comparte entre IG, TikTok y X)"
                      }
                      value={rapidApiKeyInput}
                      onChange={(e) => setRapidApiKeyInput(e.target.value)}
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>
                    RapidAPI Host (Preconfigurado para cada red)
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      placeholder={DEFAULT_HOSTS[selectedProvider]}
                      value={rapidHostInput}
                      onChange={(e) => setRapidHostInput(e.target.value)}
                    />
                  </InputGroup>
                </Field>
              </FieldGroup>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={handleSaveVaultCredentials}
                  disabled={busyAction !== null}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {busyAction === "save"
                    ? "Cifrando en PostgreSQL..."
                    : "Guardar en Bóveda Segura"}
                </Button>

                {(activeIntegration.hasAccessToken ||
                  activeIntegration.externalAccountName) && (
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    disabled={busyAction !== null}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Unplug className="h-4 w-4" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* COLUMNA 2: EXTRACCIÓN PROFUNDA EN 1 CLIC */}
            <div className="space-y-4 rounded-2xl border border-border/50 bg-secondary/10 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      2. Extracción Profunda de Publicaciones y Métricas
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Extrae hasta 30 publicaciones reales de <b>{usernameInput || activeIntegration.externalAccountName || "@usuario"}</b>, calcula sentimiento VADER y actualiza métricas por <code>external_id</code>.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={busyAction !== null}
                  >
                    {busyAction === "test"
                      ? "Probando..."
                      : "Probar Scraper"}
                  </Button>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/60 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Red seleccionada:</span>
                    <span className="font-semibold text-foreground uppercase">
                      {selectedProvider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cuenta objetivo:</span>
                    <span className="font-mono text-primary font-semibold">
                      {usernameInput ||
                        activeIntegration.externalAccountName ||
                        "No ingresada"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Modo de extracción:</span>
                    <span className="font-medium text-success">
                      {activeIntegration.hasAccessToken
                        ? "RapidAPI + Deep Scraper Fallback"
                        : "Direct Public Deep Scraper"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-foreground block">
                    Campaña destino para guardar los posts extraídos:
                  </label>
                  <select
                    value={selectedSyncCampaignId}
                    onChange={(e) => setSelectedSyncCampaignId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm text-foreground"
                  >
                    <option value="auto">
                      ✨ Crear / Actualizar campaña automática para este @usuario
                    </option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} ({c.platform} - {c.postsCount} posts)
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleSyncPosts}
                  disabled={busyAction !== null}
                  className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground py-6 text-base font-semibold shadow-lg shadow-primary/20"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${
                      busyAction === "sync" ? "animate-spin" : ""
                    }`}
                  />
                  {busyAction === "sync"
                    ? "Scrapeando publicaciones y métricas en vivo..."
                    : "Extraer Publicaciones y Métricas Ahora"}
                </Button>
              </div>

              <div className="rounded-xl bg-card/80 border border-border/50 p-3 text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Estado:{" "}
                  <strong className="text-foreground capitalize">
                    {activeIntegration.status}
                  </strong>
                </span>
                <span>
                  Última extracción:{" "}
                  <strong className="text-foreground">
                    {activeIntegration.lastSyncAt
                      ? new Date(activeIntegration.lastSyncAt).toLocaleString()
                      : "Nunca"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleSyncPosts()}
                disabled={busyAction !== null}
              >
                <RefreshCw className="h-4 w-4" />
                Deep Sync Active Platform
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setGuideOpen(true)}
              >
                <Shield className="h-4 w-4" />
                Ver Guía RapidAPI &amp; Scraper
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
