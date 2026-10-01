GOAL = 10000


def total_steps(days):
    total = 0
    for steps in days:
        total += steps
    return total


def level(steps):
    if steps >= 10000:
        return "gold"
    elif steps >= 7000:
        return "silver"
    elif steps >= 4000:
        return "bronze"
    return "none"


def goal_days(days):
    count = 0
    for i in range(len(days)):
        if days[i] >= GOAL:
            count += 1
    return count


if __name__ == "__main__":
    days = [int(word) for word in input().split()]
    total = total_steps(days)
    average = total // len(days)
    print(f"Total: {total}")
    print(f"Average: {average}")
    print(f"Level: {level(average)}")
    print(f"Days with {GOAL} steps: {goal_days(days)}")
