import React, {useEffect, useState} from "react";
import Axios from "axios";
import {Avatar, toaster} from "evergreen-ui";

export function MyCourses(props) {

    const [events, setEvents] = useState([])

    async function fetchUserEvents() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            console.log(res);
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                setEvents(data);
            }
        } catch (err) {
            toaster.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchUserEvents();
    },[])

    return (
        <div>Test</div>
    )
}