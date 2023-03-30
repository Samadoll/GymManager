import React, {useEffect, useState} from "react";
import Axios from "axios";
import {Avatar, toaster} from "evergreen-ui";

export function MyCourses(props) {

    const [Courses, setCourses] = useState([])

    async function fetchCourses() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                setCourses(data);
            }
        } catch (err) {
            toaster.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchCourses();
    },[])

    return (
        <div>Test</div>
    )
}