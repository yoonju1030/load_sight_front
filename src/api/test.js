import common from "../utils/common";

async function requestGet() {
    const value = await common.axiosCall("GET", "/api/v1/endpoint");
    return value
}

async function requestPost(params) {
    const value = await common.axiosCall("POST", "/api/v1/endpoint", params);
    return value
}

async function makeTest(params) {
    const value = await common.axiosCall("POST", "/api/tests", params);
    return value
}

async function getTests() {
    const value = await common.axiosCall("GET", "/api/tests");
    return value;
}

export {requestGet, requestPost, makeTest, getTests}