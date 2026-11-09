"""Jace owns the trust product; AgentRail owns the standalone coding workflow."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
def test_jace_readme_names_independent_trust_product_and_local_start():
    text = (ROOT / "README.md").read_text()
    assert "Acceptance Contracts" in text
    assert "no implementation or merge authority" in text
    assert "pnpm local:up" in text
    assert "Bensigo/agentrail" in text

def test_jace_is_not_a_published_agentrail_cli():
    import json
    package = json.loads((ROOT / "package.json").read_text())
    assert package["private"] is True
    assert "bin" not in package
    assert not (ROOT / ".github/workflows/publish.yml").exists()
