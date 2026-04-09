const TOKEN_REPLACEMENTS = new Map([
    ["cleaning", "clean"],
    ["cleaned", "clean"],
    ["organizing", "organize"],
    ["organised", "organize"],
    ["washing", "wash"],
    ["washed", "wash"],
    ["vacuuming", "vacuum"],
    ["mopping", "mop"],
    ["dusting", "dust"],
])

const normalizeToken = (token) => {
    if (!token) return ""

    const replacedToken = TOKEN_REPLACEMENTS.get(token) ?? token

    if (replacedToken.endsWith("ies") && replacedToken.length > 4) {
        return `${replacedToken.slice(0, -3)}y`
    }

    if (replacedToken.endsWith("ing") && replacedToken.length > 5) {
        const baseToken = replacedToken.slice(0, -3)
        return /(.)\1$/.test(baseToken) ? baseToken.slice(0, -1) : baseToken
    }

    if (replacedToken.endsWith("ed") && replacedToken.length > 4) {
        const baseToken = replacedToken.slice(0, -2)
        return /(.)\1$/.test(baseToken) ? baseToken.slice(0, -1) : baseToken
    }

    if (replacedToken.endsWith("es") && replacedToken.length > 4) {
        return replacedToken.slice(0, -2)
    }

    if (replacedToken.endsWith("s") && replacedToken.length > 3 && !replacedToken.endsWith("ss")) {
        return replacedToken.slice(0, -1)
    }

    return replacedToken
}

const tokenizeTitle = (value) => {
    return String(value || "")
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(normalizeToken)
        .filter(Boolean)
}

export const buildCanonicalChoreTitle = (value) => {
    const tokens = [...new Set(tokenizeTitle(value))].sort((left, right) => left.localeCompare(right))
    return tokens.join(" ")
}