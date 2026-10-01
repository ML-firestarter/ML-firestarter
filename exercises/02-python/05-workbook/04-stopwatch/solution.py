def format_time(seconds):
    if seconds < 0:
        raise ValueError("the time can't be negative")
    hours = seconds // 3600
    minutes = seconds % 3600 // 60
    rest = seconds % 60
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if rest > 0 or len(parts) == 0:
        parts.append(f"{rest}s")
    return " ".join(parts)


def parse_time(text):
    total = 0
    for part in text.split():
        number = int(part[:-1])
        unit = part[-1]
        if unit == "h":
            total += number * 3600
        elif unit == "m":
            total += number * 60
        elif unit == "s":
            total += number
        else:
            raise ValueError(f"{unit} isn't h, m or s")
    return total
