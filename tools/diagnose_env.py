import importlib
import os
import platform
import sys
from pathlib import Path

# Required Python modules and their display names
PACKAGES = [
    ("numpy", "numpy"),
    ("cv2", "opencv"),
    ("mediapipe", "mediapipe"),
    ("PyQt5", "PyQt5"),
    ("pyautogui", "pyautogui"),
]


def main():
    # Get the project root directory based on this file's location
    project_root = Path(__file__).resolve().parents[1]
    mpl_dir = project_root / ".matplotlib"
    mpl_dir.mkdir(exist_ok=True)
    os.environ.setdefault("MPLCONFIGDIR", str(mpl_dir))
    # Print Python version and platform information
    print("Python:", sys.version.replace("\n", " "))
    print("Platform:", platform.platform())
    # Check Python version
    major, minor = sys.version_info[:2]
    if (major, minor) not in [(3, 10), (3, 11)]:
        print("ERROR: Use Python 3.10 or 3.11 for this project.")
        return 1
    # Check required packages
    failed = []
    for module_name, label in PACKAGES:
        try:
            module = importlib.import_module(module_name)
            version = getattr(module, "__version__", "installed")
            print(f"OK: {label} ({version})")
        except Exception as exc:
            failed.append((label, exc))
            print(f"ERROR: {label} import failed: {exc}")
    # Check if any packages failed to import
    if failed:
        print("")
        print("Fix: run setup_windows.ps1 again inside PowerShell.")
        return 1
    # If all checks pass
    print("")
    print("Environment looks ready.")
    return 0

# Run the main function if this script is executed directly
if __name__ == "__main__":
    raise SystemExit(main())
