class DateTimeHelper {
  constructor(locale, timeIntervals = null) {
    this.locale = locale;
    this.timeIntervals = timeIntervals ?? [
      { name: 'seconds', seconds: 1, max: 120 },
      { name: 'minutes', seconds: 60, max: 120 },
      { name: 'hours', seconds: 60 * 60, max: 23 },
      { name: 'days', seconds: 24 * 60 * 60, max: 14 }
    ];
    this.formatterRelative = new Intl.RelativeTimeFormat(locale);
    this.formatterDate = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    this.formatterTime = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  }

  fromNow(inputTime) {
    if (!inputTime) return 'Неизвестно';
    if (Number.isNaN(inputTime)) return 'Неизвестно';
    const time = Math.floor(Math.abs(Date.now() - inputTime) / 1024);
    for (const interval of this.timeIntervals) {
      if (time < interval.max * interval.seconds) {
        const left = -Math.floor(time / interval.seconds);
        return this.formatterRelative.format(left, interval.name);
      }
    }
    return this.fullDate(inputTime);
  }

  fullDate(inputTime) {
    return `${this.formatterDate.format(inputTime)} - ${this.formatterTime.format(inputTime)}`;
  }
}

export default DateTimeHelper;
