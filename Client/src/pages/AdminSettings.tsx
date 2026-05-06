import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, Clock } from "lucide-react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/api/settingsApi";
import { Loader } from "@/components/shared/Loader";
import { cn } from "@/lib/utils";

const SHIFT_OPTIONS = [8, 16, 24];

export const AdminSettings = () => {
  const { data: settings, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentValue = settings?.shift_time ?? null;
  // pending selection takes priority, otherwise show server value
  const activeValue = selected ?? currentValue;

  const handleSave = async () => {
    if (selected === null) return;
    setErrorMsg("");
    try {
      await updateSettings({ shift_time: selected }).unwrap();
      setSaved(true);
      setSelected(null);
      setTimeout(() => setSaved(false), 3000);
      refetch();
    } catch (e: any) {
      setErrorMsg(e?.data?.message ?? "Failed to save settings.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global system parameters.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader /></div>
      ) : isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-8 text-center text-destructive">
            Failed to load settings. Please try again.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-xl">
          <Card className="shadow-sm border-t-4 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Business Day Shift Time
              </CardTitle>
              <CardDescription>
                Choose when the business day starts. Incidents are grouped by this rollover hour.
                {currentValue !== null && (
                  <> Currently set to <strong>{currentValue}:00</strong>.</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 3-option toggle */}
              <div className="flex gap-3">
                {SHIFT_OPTIONS.map((opt) => {
                  const isActive = activeValue === opt;
                  const isPendingChange = selected === opt && selected !== currentValue;
                  return (
                    <button
                      key={opt}
                      id={`shift_option_${opt}`}
                      onClick={() => {
                        setSelected(opt);
                        setErrorMsg("");
                        setSaved(false);
                      }}
                      className={cn(
                        "relative flex-1 flex flex-col items-center justify-center rounded-xl border-2 py-5 text-center transition-all duration-200 cursor-pointer select-none",
                        isActive
                          ? "border-accent bg-accent/10 shadow-md"
                          : "border-border bg-card hover:border-accent/40 hover:bg-muted/40"
                      )}
                    >
                      {isActive && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-accent" />
                      )}
                      <span className={cn(
                        "text-3xl font-extrabold tracking-tight",
                        isActive ? "text-accent" : "text-foreground"
                      )}>
                        {opt}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {opt === 24 ? "midnight" : `${opt}:00`}
                      </span>
                      {currentValue === opt && selected === null && (
                        <span className="mt-2 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                      {isPendingChange && (
                        <span className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Unsaved
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint */}
              {selected !== null && selected !== currentValue && (
                <p className="text-xs text-muted-foreground">
                  Will change from <strong>{currentValue ?? "—"}</strong> → <strong>{selected}</strong>
                </p>
              )}

              {errorMsg && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{errorMsg}</p>
              )}
              {saved && (
                <p className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-md font-medium">
                  ✓ Shift time updated successfully.
                </p>
              )}

              <Button
                id="save_settings_btn"
                onClick={handleSave}
                disabled={isSaving || selected === null || selected === currentValue}
                className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto"
              >
                {isSaving ? <Loader /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Raw settings display */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-accent" />
                All Current Settings
              </CardTitle>
              <CardDescription>All system configuration values from the API.</CardDescription>
            </CardHeader>
            <CardContent>
              {settings && Object.keys(settings).length > 0 ? (
                <div className="divide-y divide-border rounded-md border overflow-hidden">
                  {Object.entries(settings).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-mono text-muted-foreground">{key}</span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No settings found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
