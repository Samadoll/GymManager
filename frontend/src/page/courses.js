import React, {useEffect, useRef, useState} from "react";
import Axios from "axios";
import {Avatar, toaster} from "evergreen-ui";
import Scheduler from "@aldabil/react-scheduler";

export function MyCourses(props) {
    const cal = useRef(null)

    const [courses, setCourses] = useState([])
    const [fields, setFields] = useState([])

    async function fetchData() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                buildData(data)
            }
        } catch (err) {
            toaster.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchData();
    },[])

    function buildData(data) {
        buildCourses(data)
        buildFields()
    }

    function buildCourses(data) {
        // console.log(data)
        let result = data.map(x => { return {
            event_id: x.id,
            title: x.title,
            description: x.description,
            start: new Date(x.startTime),
            end: new Date(x.endTime),
            status: x.status
        }})
        cal.current.scheduler.handleState(result, "events")
        setCourses(result)
    }

    function buildFields() {
        let res = [
            {
                name: "status",
                type: "select",
                options: [
                    { id: 1, text: "Active", value: "ACTIVE" },
                    { id: 2, text: "Cancelled", value: "CANCELLED" }
                ],
                default: "ACTIVE",
                config: { label: "Status" }
            },
            {
                name: "slots",
                type: "input",
                default: 10,
                config: { label: "Available Slot" }
            },
            {
                name: "description",
                type: "input",
                default: "Course Description...",
                config: { label: "Details", multiline: true, rows: 4 }
            }
        ]
        cal.current.scheduler.handleState(res, "fields")
        setFields(res)
    }

    async function handleConfirm(e, action) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        const query = new FormData();
        query.append("startTime", e.start.getTime());
        query.append("endTime", e.end.getTime());
        query.append("availableSlots", e.slots)
        query.append("title", e.title);
        query.append("description", e.description)
        query.append("status", e.status)
        if (action === "create") {
            await Axios.post("/api/v1/course/createCourse", query, {
                headers: {
                    'Content-Type': 'application/json',
                }})
                .then(res => {
                    if (res.status === 200) {
                        toaster.success("Successfully Created")
                        e.event_id = res.data.data
                    }
                })
                .catch(error => {
                    toaster.danger("Failed to Create Course");
                })
            setCourses(cal.current.scheduler.events)
            console.log(cal.current.scheduler.events)
            return e;
        } else {

        }
    }

    return (
        <div style={{width: "80%", "margin": "auto", "background": "white", "border": "1px solid #ccc"}}>
            <button onClick={() => {
                console.log(courses)
                console.log(cal.current.scheduler)
                cal.current.scheduler.handleState(courses, "events")
            }}>Test</button>
            <Scheduler
                ref={cal}
                view="week"
                day={null}
                month={null}
                // fields={fields}
                // events={courses}
                onConfirm={(e, action) => handleConfirm(e, action)}
            />
        </div>
    )
}