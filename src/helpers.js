export let dateFormat = (date) => {
    return new Date(date).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
}

export const longDateFormat = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

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