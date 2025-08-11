export class DateFormatter {
    /**
     * Formats a Date object into a string based on the specified pattern
     *
     * @param date The Date object to format
     * @param pattern The format pattern (e.g., 'yyyy-MM-dd', 'MM/dd/yyyy')
     * @returns Formatted date string
     */
    static format(date: Date, pattern: string): string {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are 0-based
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Pad numbers with leading zeros
        const pad = (num: number, size: number = 2): string => {
            return num.toString().padStart(size, '0');
        };

        return pattern
            .replace(/yyyy/g, pad(year, 4))
            .replace(/yy/g, pad(year % 100))
            .replace(/MM/g, pad(month))
            .replace(/M/g, month.toString())
            .replace(/dd/g, pad(day))
            .replace(/d/g, day.toString())
            .replace(/HH/g, pad(hours))
            .replace(/H/g, hours.toString())
            .replace(/hh/g, pad(hours % 12 || 12))
            .replace(/h/g, (hours % 12 || 12).toString())
            .replace(/mm/g, pad(minutes))
            .replace(/m/g, minutes.toString())
            .replace(/ss/g, pad(seconds))
            .replace(/s/g, seconds.toString())
            .replace(/a/g, hours < 12 ? 'AM' : 'PM');
    }

    /**
     * Common predefined formats
     */
    static readonly Formats = {
        ISO_DATE: 'yyyy-MM-dd',
        ISO_DATETIME: 'yyyy-MM-dd HH:mm:ss',
        US_DATE: 'MM/dd/yyyy',
        US_SHORT_DATE: 'M/d/yy',
        TIME: 'HH:mm:ss',
        SHORT_TIME: 'HH:mm',
        AM_PM_TIME: 'hh:mm a'
    };
}