export const validateEmail = (email) => {
    let errorMessage = "";

    if (!email.trim()) {
        errorMessage = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessage = "Please enter a valid email address.";
    }

    const isValid = errorMessage === "";

    return { isValid, errorMessage };
};

export const htmlToPlainText = (html) => {
    if (!html) return '';

    return html
        // replace <br> and <div> with new lines
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div>/gi, '')
        // remove any remaining HTML tags
        .replace(/<\/?[^>]+(>|$)/g, '')
        // clean extra newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const getMonthStart = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

export const getMonthEnd = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
};


export const normalizeStartDate = (date, period) => {
  const d = new Date(date);

  if (period === "daily") {
    return d.toISOString().split("T")[0];
  }

  if (period === "weekly") {
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  // monthly
  return new Date(d.getFullYear(), d.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

export const getPeriodRange = (startDate, period) => {
  const start = new Date(startDate);
  let end;

  if (period === "daily") {
    end = new Date(start);
  }

  if (period === "weekly") {
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  }

  if (period === "monthly") {
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};



