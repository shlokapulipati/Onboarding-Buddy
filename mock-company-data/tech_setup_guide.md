<!-- tech_setup_guide.md -->

# Technical Environment Setup Guide
## FAQ Format (20 Questions)

---

### Section 1: Core Stack Installation

**Q1. What are the three core tools I need to install before starting development?**
Before writing a single line of code, every engineer must install Git, Node.js (LTS version, currently 20.x), and PostgreSQL. These form the foundation of our local development environment and are non-negotiable prerequisites. All three must be installed natively on your machine rather than through a containerized shortcut, at least for your first setup, so you understand the underlying configuration. Skipping any one of them will cause the project's install scripts to fail immediately.

**Q2. Why does Git need to be configured right after installation?**
Git must be immediately configured with your corporate email using `git config --global user.email` and `git config --global user.name`. Commits made without proper identity configuration will be rejected by our pre-commit hooks, which validate committer identity against our internal directory. This is a security measure to ensure all commits are traceable to a verified employee. You only need to run this configuration once per machine, not per repository.

**Q3. Why must I use the Node.js LTS version instead of the latest release?**
Node.js must be installed strictly through the LTS channel rather than the "Current" release. Several of our internal build tools and npm packages have known compatibility issues with non-LTS versions and will throw obscure dependency resolution errors otherwise. The LTS channel receives longer-term security patches without introducing breaking changes mid-project. If you've already installed a non-LTS version, use a version manager like `nvm` to switch to the correct LTS release.

**Q4. What should I be careful about during PostgreSQL installation?**
PostgreSQL should be installed with the default port (5432) left unchanged to avoid conflicts with our connection strings. During setup you must securely record the superuser password you create, as this cannot be recovered later without a full reinstall. It's recommended to store this password in your company-issued password manager immediately rather than in a plain text file. Losing this password mid-project is a common and entirely avoidable source of lost setup time.

**Q5. How do I confirm all three tools installed correctly?**
Once all three are installed, run `git --version`, `node -v`, and `psql --version` in your terminal to confirm each tool is correctly recognized. Each command should return a version number without any "command not found" errors. If any command fails, it usually indicates either an incomplete installation or a PATH configuration issue (see Section 2). Always run this verification step before moving on to project-specific setup instructions.

**Q6. Can I skip installing PostgreSQL locally and just use a cloud database?**
While cloud databases can work for later-stage development, local PostgreSQL installation is required during initial setup so you can run and test migrations offline. This also lets you experiment with schema changes without risking shared development data. Once your local environment is stable, connecting to a shared staging database is optional and team-dependent. New engineers should always start with a fully local setup before touching any shared infrastructure.

**Q7. What if `npm` commands are extremely slow after a fresh Node.js install?**
This is often unrelated to Node.js itself and is instead caused by npm's default registry resolution taking longer on first use as it builds its local cache. Running `npm config set registry https://registry.npmjs.org/` explicitly can sometimes resolve regional resolution slowness. If the issue persists, verify your machine's internet connection isn't being throttled by a corporate VPN. This is a one-time slowdown and subsequent installs are typically much faster.

---

### Section 2: Environment Variables & System PATH Corruption Fixes

**Q8. Why did my `npm` and `git` commands suddenly stop working after installing PostgreSQL?**
A surprisingly common issue is that installing PostgreSQL — particularly on Windows — silently overwrites or truncates the existing system PATH variable. This causes previously working terminal commands like `npm`, `git`, and even `cd` shortcuts to suddenly return "command not recognized" errors. This happens because the PostgreSQL installer sometimes writes its own bin directory to the PATH using a method that replaces rather than appends to the existing variable string. This is especially likely when the PATH was already near the character length limit imposed by Windows.

**Q9. How do I open the system PATH settings to investigate this?**
Open the System Properties panel, navigate to "Advanced," then "Environment Variables," and locate the "Path" entry under System Variables. This shows you the full list of directories the OS searches when you type a command in the terminal. It's worth taking a screenshot of the current list before editing anything, in case you need to revert. This panel is the single source of truth for why a command is or isn't recognized.

**Q10. What exactly should I check for once I'm in the PATH editor?**
Manually inspect the list for missing entries such as the Node.js install directory (typically `C:\Program Files\nodejs\`) and the Git cmd directory (typically `C:\Program Files\Git\cmd`). If either is missing, that explains why `node`, `npm`, or `git` stopped being recognized. Compare this against a working teammate's PATH list if you're unsure what's supposed to be there. Missing entries are the single most common root cause of this issue.

**Q11. Should I edit the existing PATH string directly to fix it?**
No — re-add any missing paths as separate entries rather than editing the existing string directly, since manual string editing is error-prone and can introduce syntax mistakes. Most modern PATH editors show entries as a clean list where you can click "New" to add an entry safely. This approach avoids accidentally deleting or corrupting adjacent valid entries. Always use the structured list editor rather than a raw text field when available.

**Q12. How do I fix `psql` not being recognized after PostgreSQL installation?**
Append the PostgreSQL binary directory (typically `C:\Program Files\PostgreSQL\16\bin`) as its own new PATH entry so that `psql` becomes globally recognized. The exact version number in the path will vary depending on which PostgreSQL version you installed. Double-check the actual install directory on your machine rather than assuming the default, since custom install locations are common. Once added, `psql` should be recognized immediately after restarting your terminal.

**Q13. Do I need to restart anything after fixing the PATH?**
Yes — after saving these changes, you must fully close and reopen your terminal for the updated PATH to take effect. On older Windows builds, a full machine restart may be required for the change to propagate system-wide. Simply opening a new terminal tab within the same window is sometimes not enough — a completely new terminal process is required. After restarting, re-run the verification commands from Section 1 to confirm all three tools respond correctly again.

**Q14. Is this PATH corruption issue specific to Windows, or does it happen on Mac/Linux too?**
This specific silent-overwrite behavior is predominantly a Windows issue due to how its PATH variable is structured. On Mac and Linux, PostgreSQL installers typically append to your shell profile file (like `.zshrc` or `.bash_profile`) rather than overwriting a system-level variable. However, if commands aren't recognized on Mac/Linux, check that your shell profile was actually sourced by running `source ~/.zshrc`. Homebrew-based installs on Mac rarely cause this issue since they follow a more predictable path convention.

---

### Section 3: Local Database Schema & JSONB Parameter Mismatches

**Q15. How do I initialize my local PostgreSQL database for this project?**
First log into `psql` using `psql -U postgres`, then create a dedicated database for the project using `CREATE DATABASE onboarding_buddy_dev;`. Connect to it with `\c onboarding_buddy_dev` before running any schema creation scripts. It's good practice to name your local dev database distinctly from any staging or production database to avoid accidental cross-connection. Always confirm you're connected to the right database with `\conninfo` before running destructive commands.

**Q16. When should I use the JSONB data type instead of TEXT?**
When designing tables that need to track dynamic user state or store JSON-style payloads — such as a `user_sessions` or `agent_context_log` table — you must use PostgreSQL's `JSONB` data type rather than plain `TEXT` or the older `JSON` type. JSONB stores data in a binary format that supports indexing and significantly faster querying compared to text-based storage. It also allows you to query nested fields directly using PostgreSQL's JSON operators without parsing the entire blob in application code. TEXT should be reserved for genuinely unstructured string data, not structured payloads.

**Q17. What causes the most common JSONB-related bugs on this project?**
The most frequent bug occurs when the backend interface sends a JSON payload with a slightly different key structure or data type than what the JSONB column expects. A common example is sending a stringified number where the schema expects an integer nested inside the object. This causes silent type mismatches that only surface as broken UI rendering rather than a clear database error, making them frustrating to debug. These issues rarely throw an exception at insert time, which is what makes them so easy to miss.

**Q18. How can I prevent JSONB payload mismatches before they cause bugs?**
Always validate your payload shape against the schema definition using a validation library like Zod or Joi on the backend before the insert or update query runs. This ensures the JSONB structure written to the database exactly matches what the frontend expects to parse back out later. Adding this validation as a middleware step means malformed payloads get rejected immediately with a clear error, rather than silently corrupting downstream