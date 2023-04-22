import Axios from "axios";

class JAxios {
    static get(url) {
        return Axios.get(url);
    }

    static post(url, data) {
        return Axios({
            method: "post",
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static put(url, data) {
        return Axios({
            method: "put",
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    static delete(url) {
        return Axios.delete(url);
    }

    static method(method, url, data) {
        if (method === "post") {
            return this.post(url, data);
        } else if (method === "put") {
            return this.put(url, data);
        }
    }
}

export default JAxios
