NUMPY = "'[project]\\nname = \"a\"\\ndependencies = [\"numpy>=2.4.6\", \"torch\"]\\n'"
FANCY = "'[project]\\nname = \"a\"\\ndependencies = [\"Pillow ~= 10.0\", \"rich[jupyter]>=13\", \"pandas==2.1.*; python_version >= \\'3.9\\'\", \"scikit_learn\"]\\n'"
DEV = "'[project]\\nname = \"a\"\\ndependencies = []\\n\\n[dependency-groups]\\ndev = [\"pytest>=9.1.1\", \"Ruff\"]\\n'"
NONE = "'[project]\\nname = \"a\"\\n'"
SCRIPT = "'# /// script\\n# requires-python = \">=3.12\"\\n# dependencies = [\\n#     \"numpy\",\\n#     \"rich>=13\",\\n# ]\\n# ///\\nimport numpy\\n'"
CHECKS = [
    (f"dependency_names({NUMPY})", ["numpy", "torch"]),
    (f"dependency_names({FANCY})", ["pandas", "pillow", "rich", "scikit_learn"]),
    (f"dependency_names({NONE})", []),
    (f"dependency_names({DEV})", []),
    (f"dev_dependencies({DEV})", ["pytest", "ruff"]),
    (f"dev_dependencies({NUMPY})", []),
    (f"script_dependencies({SCRIPT})", ["numpy", "rich>=13"]),
    ("script_dependencies('print(1)\\n')", []),
    ("script_dependencies('# /// script\\n# requires-python = \">=3.12\"\\n# ///\\nprint(1)\\n')", []),
    ("script_dependencies('# just a comment\\n# dependencies = [\"x\"]\\nprint(1)\\n')", []),
    ("script_dependencies('# /// script\\n# dependencies = [\"torch\"]\\n# ///\\n')", ["torch"]),
]
