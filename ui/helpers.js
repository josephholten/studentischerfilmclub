export function datetimeFormat(datetime) {
    // datetime in: YYYY-mm-ddThh:mm
    const sep_index = datetime.indexOf("T")
    const date = datetime.slice(0, sep_index).split("-")
    const time = datetime.slice(sep_index+1).split(":")
    return `${date[2]}.${date[1]}.${date[0]} ${time.slice(0,2).join(":")}`
}

export function dateFormat(datetime) {
    // datetime in: YYYY-mm-ddThh:mm
    const sep_index = datetime.indexOf("T")
    const date = datetime.slice(0, sep_index).split("-")
    return `${date[2]}.${date[1]}.${date[0]}`
}

export function getFormData(form) {
    return Object.fromEntries((new FormData(form)).entries())
}