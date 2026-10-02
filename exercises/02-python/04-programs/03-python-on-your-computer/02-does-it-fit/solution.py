def parse_version(version):
    return tuple(int(part) for part in version.split("."))


def allows(specifier, version):
    have = parse_version(version)
    for clause in specifier.split(","):
        clause = clause.strip()
        if clause == "":
            continue
        for operator in (">=", "<=", "==", "!=", ">", "<"):
            if clause.startswith(operator):
                break
        else:
            raise ValueError(f"unknown specifier: {clause}")
        wanted = parse_version(clause[len(operator):])
        size = max(len(have), len(wanted))
        left = have + (0,) * (size - len(have))
        right = wanted + (0,) * (size - len(wanted))
        if operator == ">=":
            fits = left >= right
        elif operator == "<=":
            fits = left <= right
        elif operator == "==":
            fits = left == right
        elif operator == "!=":
            fits = left != right
        elif operator == ">":
            fits = left > right
        else:
            fits = left < right
        if not fits:
            return False
    return True


if __name__ == "__main__":
    print(allows(">=2.0,<3", "2.4.6"))
    print(allows(">=2.0,<3", "3.0"))
