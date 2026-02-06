export function getPeriodDateFilter(period = "30 days") {
    switch (period) {
        case "7 days":
        return "AND date >= date('now', '-7 days')";

        case "30 days":
        return "AND date >= date('now', '-30 days')";

        case "3 months":
        return "AND date >= date('now', '-3 months')";

        case "6 months":
        return "AND date >= date('now', '-6 months')";

        case "1 year":
        return "AND date >= date('now', '-1 year')";

        case "This Month":
        default:
        return "AND date >= date('now', 'start of month')";
    }
}
