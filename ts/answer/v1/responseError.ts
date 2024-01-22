export default function responseError(res, next, errorLog, error = errorObject(errorUnexpected.error.message)): void {
    console.log(errorLog);
    return res.json({ ...error });
}
export const errorObject = (errorMessage: string) => {
    return {
        status: "error",
        data: {},
        error: {
            message: errorMessage,
        },
    }
}

const errorUnexpected = {
    status: "error",
    data: {},
    error: {
        message: "Unexpected error!"
    },
}