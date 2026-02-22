export function getPeriodDateFilter(period = "30 days", column = "date") {
    switch (period) {
        case "7 days":
        return `AND datetime(${column}) >= datetime('now','-7 days')`;

        case "30 days":
        return `AND datetime(${column}) >= datetime('now','-30 days')`;

        case "3 months":
        return `AND datetime(${column}) >= datetime('now','-3 months')`;

        case "6 months":
        return `AND datetime(${column}) >= datetime('now','-6 months')`;

        case "1 year":
        return `AND datetime(${column}) >= datetime('now','-1 year')`;

        case "This Month":
        default:
        return `AND strftime('%Y-%m', ${column}) = strftime('%Y-%m','now')`;
    }
}