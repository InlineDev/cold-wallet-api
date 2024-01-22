export default function responseSuccess(res, next, data=dataObject): void {
    return res.json({ ...data });
}

const dataObject = {
    status: "OK",
    data: {},
    error: {},
}