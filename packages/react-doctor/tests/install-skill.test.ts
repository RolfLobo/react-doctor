import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { runInstallSkill } from "../src/cli/utils/install-skill.js";
import { setSpinnerSilent } from "../src/cli/utils/spinner.js";
import { silenceConsoleForTest } from "./helpers/silence-console.js";

interface InstallSkillFixture {
  projectRoot: string;
  sourceDir: string;
  cleanup: () => void;
}

const setupFixture = (): InstallSkillFixture => {
  const root = mkdtempSync(path.join(tmpdir(), "react-doctor-install-skill-"));
  const projectRoot = path.join(root, "project");
  const sourceDir = path.join(root, "source");
  mkdirSync(projectRoot, { recursive: true });
  mkdirSync(sourceDir, { recursive: true });
  return {
    projectRoot,
    sourceDir,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
};

const writeValidSkill = (sourceDir: string): void => {
  writeFileSync(
    path.join(sourceDir, "SKILL.md"),
    "---\nname: react-doctor\ndescription: Test skill for install fixtures\n---\n# react-doctor\n",
  );
};

describe("runInstallSkill", () => {
  let fixture: InstallSkillFixture;
  let originalExitCode: number | string | null | undefined;
  let originalCi: string | undefined;
  let restoreConsole: () => void;

  beforeEach(() => {
    fixture = setupFixture();
    originalExitCode = process.exitCode;
    originalCi = process.env.CI;
    process.exitCode = 0;
    restoreConsole = silenceConsoleForTest();
    setSpinnerSilent(true);
  });

  afterEach(() => {
    fixture.cleanup();
    process.exitCode = originalExitCode;
    if (originalCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = originalCi;
    }
    restoreConsole();
    setSpinnerSilent(false);
  });

  it("exits with code 1 when the bundled SKILL.md is missing", async () => {
    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor"],
    });
    expect(process.exitCode).toBe(1);
  });

  it("exits with code 1 when no agents are detected", async () => {
    writeValidSkill(fixture.sourceDir);
    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: [],
    });
    expect(process.exitCode).toBe(1);
    expect(existsSync(path.join(fixture.projectRoot, ".agents"))).toBe(false);
  });

  it("throws when SKILL.md exists but has no parseable frontmatter (H1 silent-success regression guard)", async () => {
    // HACK: agent-install's discoverSkills returns an empty array for
    // SKILL.md without `name:` / `description:` frontmatter. Before the
    // fix, our wrapper only checked `failed.length > 0` and reported
    // success even though zero files were written.
    writeFileSync(
      path.join(fixture.sourceDir, "SKILL.md"),
      "# Just a heading, no frontmatter\nNothing here.\n",
    );
    await expect(
      runInstallSkill({
        yes: true,
        sourceDir: fixture.sourceDir,
        projectRoot: fixture.projectRoot,
        detectedAgents: ["cursor"],
      }),
    ).rejects.toThrow(/Could not parse SKILL\.md/);
  });

  it("throws when frontmatter is missing the required `description` field (H1 regression guard)", async () => {
    writeFileSync(
      path.join(fixture.sourceDir, "SKILL.md"),
      "---\nname: react-doctor\n---\n# react-doctor\n",
    );
    await expect(
      runInstallSkill({
        yes: true,
        sourceDir: fixture.sourceDir,
        projectRoot: fixture.projectRoot,
        detectedAgents: ["cursor"],
      }),
    ).rejects.toThrow(/Could not parse SKILL\.md/);
  });

  it("--dry-run writes nothing, even with valid SKILL.md and detected agents", async () => {
    writeValidSkill(fixture.sourceDir);
    await runInstallSkill({
      yes: true,
      dryRun: true,
      agentHooks: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor", "claude-code"],
    });
    expect(existsSync(path.join(fixture.projectRoot, ".agents"))).toBe(false);
    expect(existsSync(path.join(fixture.projectRoot, ".claude"))).toBe(false);
    expect(existsSync(path.join(fixture.projectRoot, ".cursor"))).toBe(false);
    expect(existsSync(path.join(fixture.projectRoot, ".factory"))).toBe(false);
  });

  it("installs the skill into the universal .agents/skills directory for a universal agent", async () => {
    writeValidSkill(fixture.sourceDir);
    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor"],
    });
    expect(existsSync(path.join(fixture.projectRoot, ".agents/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
  });

  it("installs the skill into a vendor-specific directory for a non-universal agent", async () => {
    writeValidSkill(fixture.sourceDir);
    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["claude-code"],
    });
    expect(existsSync(path.join(fixture.projectRoot, ".claude/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
  });

  it("installs the skill into .factory/skills for the droid agent (upstream agent-install@0.0.3)", async () => {
    writeValidSkill(fixture.sourceDir);
    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["droid"],
    });
    expect(
      existsSync(path.join(fixture.projectRoot, ".factory/skills/react-doctor/SKILL.md")),
    ).toBe(true);
  });

  it("--yes installs a non-blocking pre-commit hook when a git hook target is detected", async () => {
    writeValidSkill(fixture.sourceDir);
    const hookPath = path.join(fixture.projectRoot, ".git/hooks/pre-commit");

    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor"],
      gitHookPath: hookPath,
    });

    expect(existsSync(path.join(fixture.projectRoot, ".agents/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(readFileSync(hookPath, "utf8")).toContain(
      "react-doctor --staged --fail-on warning",
    );
    expect(existsSync(path.join(fixture.projectRoot, ".react-doctor/hooks/pre-commit"))).toBe(
      false,
    );
  });

  it("--agent-hooks installs native hooks for selected supported agents", async () => {
    writeValidSkill(fixture.sourceDir);

    await runInstallSkill({
      yes: true,
      agentHooks: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor", "claude-code", "codex"],
      gitHookPath: null,
    });

    expect(existsSync(path.join(fixture.projectRoot, ".agents/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(path.join(fixture.projectRoot, ".claude/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(readFileSync(path.join(fixture.projectRoot, ".claude/settings.json"), "utf8")).toContain(
      "PostToolBatch",
    );
    expect(readFileSync(path.join(fixture.projectRoot, ".cursor/hooks.json"), "utf8")).toContain(
      "postToolUse",
    );
    expect(existsSync(path.join(fixture.projectRoot, ".codex/hooks.json"))).toBe(false);
  });

  it("--yes does not install native agent hooks unless --agent-hooks is set", async () => {
    writeValidSkill(fixture.sourceDir);

    await runInstallSkill({
      yes: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor", "claude-code"],
      gitHookPath: null,
    });

    expect(existsSync(path.join(fixture.projectRoot, ".agents/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(path.join(fixture.projectRoot, ".claude/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(existsSync(path.join(fixture.projectRoot, ".cursor/hooks.json"))).toBe(false);
    expect(existsSync(path.join(fixture.projectRoot, ".claude/settings.json"))).toBe(false);
  });

  it("--yes installs Git and agent hooks in CI using real git detection", async () => {
    writeValidSkill(fixture.sourceDir);
    process.env.CI = "1";
    execFileSync("git", ["init"], { cwd: fixture.projectRoot, stdio: "ignore" });

    await runInstallSkill({
      yes: true,
      agentHooks: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor", "claude-code"],
    });

    expect(readFileSync(path.join(fixture.projectRoot, ".git/hooks/pre-commit"), "utf8")).toContain(
      "react-doctor --staged --fail-on warning",
    );
    expect(existsSync(path.join(fixture.projectRoot, ".react-doctor/hooks/pre-commit"))).toBe(
      false,
    );
    expect(readFileSync(path.join(fixture.projectRoot, ".cursor/hooks.json"), "utf8")).toContain(
      "postToolUse",
    );
    expect(readFileSync(path.join(fixture.projectRoot, ".claude/settings.json"), "utf8")).toContain(
      "PostToolBatch",
    );
  });

  it("CI skips prompts without --yes but does not install the optional Git hook", async () => {
    writeValidSkill(fixture.sourceDir);
    process.env.CI = "1";
    execFileSync("git", ["init"], { cwd: fixture.projectRoot, stdio: "ignore" });

    await runInstallSkill({
      agentHooks: true,
      sourceDir: fixture.sourceDir,
      projectRoot: fixture.projectRoot,
      detectedAgents: ["cursor"],
    });

    expect(existsSync(path.join(fixture.projectRoot, ".agents/skills/react-doctor/SKILL.md"))).toBe(
      true,
    );
    expect(readFileSync(path.join(fixture.projectRoot, ".cursor/hooks.json"), "utf8")).toContain(
      "postToolUse",
    );
    expect(existsSync(path.join(fixture.projectRoot, ".git/hooks/pre-commit"))).toBe(false);
    expect(existsSync(path.join(fixture.projectRoot, ".react-doctor/hooks/pre-commit"))).toBe(
      false,
    );
  });
});
