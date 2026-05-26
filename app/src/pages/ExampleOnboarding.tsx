import { useState } from "react";
import {
  Button,
  CheckboxCards,
  FileDropzone,
  Switch,
  Textarea,
  Toast,
} from "FrameUI";

const TEAM_OPTIONS = [
  { value: "design", label: "Design", description: "UI patterns and systems" },
  { value: "frontend", label: "Frontend", description: "React and app flows" },
  { value: "platform", label: "Platform", description: "Infra and tooling" },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function ExampleOnboarding() {
  const [bio, setBio] = useState("");
  const [teams, setTeams] = useState<string[]>(["frontend"]);
  const [newsletter, setNewsletter] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = Toast.useToast();

  const handleSave = () => {
    toast.success({
      title: "Profile saved",
      description: `Selected teams: ${teams.length > 0 ? teams.join(", ") : "none"}.`,
    });
  };

  const handleReset = () => {
    setBio("");
    setTeams([]);
    setNewsletter(false);
    setFiles([]);
  };

  return (
    <div className="demo-page">
      <header className="demo-page-header">
        <h2>Team onboarding</h2>
        <p className="demo-muted">
          Collect basic information using minimal layout and default component styles.
        </p>
      </header>

      <section className="demo-section">
        <h3>About you</h3>
        <Textarea
          placeholder="Share a short intro and what you want to build."
          minRows={3}
          maxRows={6}
          value={bio}
          onValueChange={setBio}
        />
      </section>

      <section className="demo-section">
        <div className="demo-grid">
          <div className="demo-card">
            <h3>Focus areas</h3>
            <CheckboxCards value={teams} onValueChange={setTeams} options={TEAM_OPTIONS} />
          </div>
          <div className="demo-card">
            <h3>Preferences</h3>
            <div className="demo-row">
              <Switch
                checked={newsletter}
                onCheckedChange={setNewsletter}
                aria-label="Receive weekly updates"
              />
              <span>Receive weekly updates</span>
            </div>
            <p className="demo-muted">Toggle built with FrameUI Switch.</p>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h3>Sample files</h3>
        <FileDropzone
          files={files}
          onFilesChange={setFiles}
          accept="image/*"
          maxFiles={3}
          multiple
        >
          <FileDropzone.Zone aria-label="Upload sample files">
            <span>Drop images here</span>
            <span className="fdz-hint">PNG or JPG, up to 3 files</span>
          </FileDropzone.Zone>
          <FileDropzone.Input />
          {files.length > 0 ? (
            <FileDropzone.FileList>
              {(file) => (
                <FileDropzone.FileItem
                  key={`${file.name}-${file.lastModified}`}
                  file={file}
                >
                  <span className="fdz-name">{file.name}</span>
                  <span className="fdz-size">{formatFileSize(file.size)}</span>
                  <FileDropzone.Remove file={file}>×</FileDropzone.Remove>
                </FileDropzone.FileItem>
              )}
            </FileDropzone.FileList>
          ) : null}
        </FileDropzone>
      </section>

      <div className="demo-actions">
        <Button label="Save profile" onClick={handleSave} />
        <Button label="Reset" onClick={handleReset} />
      </div>
    </div>
  );
}
