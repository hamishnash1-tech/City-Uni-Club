import Foundation

private let inputFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    f.locale = Locale(identifier: "en_GB_POSIX")
    f.timeZone = TimeZone(identifier: "UTC")
    return f
}()

private let outputFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "LLLL yyyy"
    f.locale = Locale(identifier: "en_GB")
    return f
}()

func formatMonthYear(_ isoDate: String?) -> String {
    guard let isoDate, !isoDate.isEmpty else { return "" }
    let trimmed = String(isoDate.prefix(10))
    guard let date = inputFormatter.date(from: trimmed) else { return "" }
    return outputFormatter.string(from: date)
}
