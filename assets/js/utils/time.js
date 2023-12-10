export function format(date, template = null) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (template == null) {
    if (hours >= 10) {
      template = 'hh:mm:ss';
    } else if (hours >= 1) {
      template = 'h:mm:ss';
    } else if (minutes >= 10) {
      template = 'mm:ss';
    } else {
      template = 'm:ss';
    }
  }

  const matches = (match) => {
    switch (match) {
      case 'h':
        return String(hours);
      case 'hh':
        return String(hours).padStart(2, '0');
      case 'm':
        return String(minutes);
      case 'mm':
        return String(minutes).padStart(2, '0');
      case 's':
        return String(seconds);
      case 'ss':
        return String(seconds).padStart(2, '0');
      default:
        return null;
    }
  };
  return template.replace(/h{1,2}|m{1,2}|s{1,2}/g, matches);
}

export function formatSeconds(seconds, template = null) {
  return format(new Date(0, 0, 0, 0, 0, seconds), template);
}
