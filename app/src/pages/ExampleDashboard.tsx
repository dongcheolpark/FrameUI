import { useState } from "react";
import { Accordion, Button, Slider, Switch, Toast } from "FrameUI";

export function ExampleDashboard() {
  const [alerts, setAlerts] = useState(true);
  const [sync, setSync] = useState(false);
  const [quota, setQuota] = useState(65);
  const { toast } = Toast.useToast();

  const handleSave = () => {
    toast.success({
      title: "Settings saved",
      description: `Alerts: ${alerts ? "on" : "off"}, Sync: ${sync ? "on" : "off"}`,
    });
  };

  return (
    <div className="demo-page">
      <header className="demo-page-header">
        <h2>Dashboard</h2>
        <p className="demo-muted">
          Toggle settings and tune limits with Switch, Slider, and Accordion.
        </p>
      </header>

      <section className="demo-section">
        <div className="demo-grid">
          <div className="demo-card">
            <h3>Feature toggles</h3>
            <div className="demo-row">
              <Switch checked={alerts} onCheckedChange={setAlerts} aria-label="Alerts" />
              <span>Realtime alerts</span>
            </div>
            <div className="demo-row">
              <Switch checked={sync} onCheckedChange={setSync} aria-label="Auto sync" />
              <span>Auto sync</span>
            </div>
          </div>

          <div className="demo-card">
            <h3>Usage cap</h3>
            <div className="demo-row">
              <span>Monthly limit</span>
              <strong>{quota}%</strong>
            </div>
            <Slider
              aria-label="Monthly limit"
              value={quota}
              onValueChange={setQuota}
            />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h3>Help</h3>
        <Accordion.Root type="single" collapsible defaultValue="tips" className="demo-accordion">
          <Accordion.Item value="tips">
            <Accordion.Header>
              <Accordion.Trigger>Tips for faster onboarding</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              Keep your project naming consistent and share an internal glossary.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="policies">
            <Accordion.Header>
              <Accordion.Trigger>Data retention policy</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              Records are stored for 90 days unless a longer policy is enabled.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </section>

      <div className="demo-actions">
        <Button label="Save settings" onClick={handleSave} />
      </div>
    </div>
  );
}
