"""Quick setup script — run this first."""
import os
import json
import shutil


def setup():
    print("\n  SnapCAC Setup\n")

    # Copy example config
    if not os.path.exists("config.json"):
        shutil.copy("config.example.json", "config.json")
        print("  ✅ config.json created from example")
    else:
        print("  ℹ️  config.json already exists")

    # Ask for Anthropic key
    existing = json.load(open("config.json"))
    if existing.get("anthropic_api_key") == "YOUR_ANTHROPIC_API_KEY":
        key = input("\n  Enter Anthropic API key (or press Enter to skip for demo): ").strip()
        if key:
            existing["anthropic_api_key"] = key
            with open("config.json", "w") as f:
                json.dump(existing, f, indent=2)
            print("  ✅ Anthropic API key saved")
        else:
            print("  ⚠️  Running in demo mode (fallback scripts, no AI generation)")

    print("\n  ✅ Setup complete. Run: python main.py run\n")


if __name__ == "__main__":
    setup()
