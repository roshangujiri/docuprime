/**
 * A basic utility js file for utilizing reuseable code.
 */
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
/**
 * Fires a ShowToastEvent event.
 * @param {object} cmp - Component reference for dispatching the event.
 * @param {string} title - Name of the title.
 * @param {string} message - Message to be shown on the toast.
 * @param {string} variant - Name of the variant.
 */
const showCustomToast = (cmp, title, message, variant) => {
    cmp.dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }),
    );
}

/**
 * Fires a ShowToastEvent event to show error message.
 * @param {object} cmp - Component reference for dispatching the event.
 * @param {object} error - Error object.
 * @param {String} source - source of error.
 */
const showError = (cmp, errors, source = null) => {
    let errorMsg = reduceError(errors, source);
    showCustomToast(cmp, 'Error', errorMsg + '', 'error');
    return errorMsg;
}

/**
 * Parses error object to get error message.
 * @param {object} error - Error object.
 * @param {String} source - source of error.
 */
const reduceError = (errors, source = null) => {
    let errorMsg = '';
    if (source) {
        console.error('Error in ' + source + ': ' + JSON.stringify(errors));
    } else {
        console.error('Error: ' + JSON.stringify(errors));
    }

    if (isObjectEmpty(errors)) {
        errorMsg = 'Unknown error';
    }
    else if (!Array.isArray(errors)) {
        errors = [errors];
    }
    if (!errorMsg) {
        errorMsg = errors
            // Remove null/undefined items
            .filter(error => !!error)
            // Extract an error message
            .map(error => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message).join(', ');
                }
                // FIELD VALIDATION, FIELD, and trigger.addError
                else if (error.body && error.body.enhancedErrorType &&
                    error.body.enhancedErrorType.toLowerCase() === 'recorderror' &&
                    error.body.output) {
                    let firstError = '';
                    if (error.body.output.errors.length &&
                        error.body.output.errors[0].errorCode === 'INSUFFICIENT_ACCESS_OR_READONLY') {
                        firstError = error.body.output.errors[0].message;
                    }
                    if (error.body.output.errors.length &&
                        error.body.output.errors[0].errorCode === 'FIELD_CUSTOM_VALIDATION_EXCEPTION') {
                        firstError = error.body.output.errors[0].message;
                    }
                    if (error.body.output.errors.length &&
                        error.body.output.errors[0].errorCode === 'CANNOT_EXECUTE_FLOW_TRIGGER') {
                        firstError = error.body.output.errors[0].message;
                    }
                    if (!error.body.output.errors.length && error.body.output.fieldErrors) {
                        // Unknown format
                        firstError = error.body.output.fieldErrors[Object.keys(error.body.output.fieldErrors)[0]][0].message;
                    }
                    return firstError;
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                // Network error
                else if (error.body && typeof error.body.error === 'string') {
                    return error.body.error;
                }
                // PAGE ERRORS
                else if (error.body && error.body.pageErrors.length) {
                    return error.body.pageErrors[0].message;
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                else if (error.statusText) {
                    return 'Status code: ' + error.statusText;
                }
                return error;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter(message => !!message);
    }

    return errorMsg;
}

/**
 * Checks if object is empty {}.
 * @param {object} obj - Object to be checked if empty.
 */
const isObjectEmpty = (obj) => {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            return false;
        }
    }
    return true;
}

/**
 * Formats the date.
 * @param {string} date - date format string.
 */
const formatDate = (date) => {
    if (date !== undefined && date !== "") {
        var inputDate = new Date(date);
        var month = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        var str = month[inputDate.getMonth()] + " " +
            inputDate.getDate() +
            getNumberSuffix(inputDate.getDate()) + ", " +
            inputDate.getFullYear();
        return str;
    }
    return "";
}

/**
 * Returns the number suffix.
 * @param {number} number - positive integer number.
 */
const getNumberSuffix = (number) => {
    if (number >= 11 && number <= 13) {
        return "th";
    }
    switch (number % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

/**
 * Returns property name in provided object.
 * @param {string} prop - property name.
 * @param {object} obj - Object to be searched for property.
 */
const retrievePropertyIgnoreCase = (prop, obj) => {
    prop = (prop + "").toLowerCase();
    let propIgnoreCase;
    for (var p in obj) {
        if (obj.hasOwnProperty(p) && prop == (p + "").toLowerCase()) {
            propIgnoreCase = p;
            break;
        }
    }
    return propIgnoreCase;
}

/**
 * Excutes a function in try/catch block to get a safe value.
 * Otherwise returns a default value passed.
 * @param {function} fn - function definition.
 * @param {object} defaultValue - default value to be returned.
 */
const getSafeValue = (fn, defaultValue) => {
    try {
        return fn();
    } catch (e) {
        return defaultValue;
    }
}


let requestWrapperForUpload = (base64Data) => {
    return requestWrapperForUpload = {
        request: {
            requestPayload: base64Data,
            serviceName: "Add_Template",
            queryParams: ""
        }
    }
}
let requestWrapperForGetTemplate = (queryParams) => {
    return requestWrapperForGetTemplate = {
        request: {
            requestPayload: "",
            serviceName: "Get_Template",
            queryParams: queryParams
        }
    }
}
let requestWrapperForRender = (queryParams, requestPayload) => {
    return requestWrapperForRender = {
        request: {
            serviceName: `carbone_render`,
            queryParams: queryParams,
            requestPayload: requestPayload
        }
    }
}
let carboneRenderUrl = 'https://render.carbone.io/render'

export {
    reduceError,
    showCustomToast,
    showError,
    isObjectEmpty,
    formatDate,
    getNumberSuffix,
    retrievePropertyIgnoreCase,
    getSafeValue,
    requestWrapperForUpload,
    requestWrapperForRender,
    carboneRenderUrl,
    requestWrapperForGetTemplate

};