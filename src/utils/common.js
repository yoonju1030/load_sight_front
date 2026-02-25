import axios from 'axios';

const axiosService = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
});

const axiosCall = async (method, url, params = {}, errorFunc = false) => {
    let axios = axiosService;
    let option = { withCredentials: true };

    try {
        switch (method) {
            case "GET":
                return await axios.get(url, option);

            case "POST":
                return await axios.post(url, params, option);

            default:
                throw new Error("Unsupported method");
        }
    } catch (err) {
        if (errorFunc) {
            errorFunc(err);
        } else {
            throw err;   // 에러를 상위로 던지는 게 더 정상적인 구조
        }
    }
};

const commonObj = {
    axiosCall
}

export default commonObj;