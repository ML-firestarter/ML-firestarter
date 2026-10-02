def parse_version(version):
    return tuple(int(part) for part in version.split("."))


def allows(specifier, version):
    return True


if __name__ == "__main__":
    print(allows(">=2.0,<3", "2.4.6"))
    print(allows(">=2.0,<3", "3.0"))
