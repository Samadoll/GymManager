package com.jw.gymmanager.controller;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.service.CourseService;
import com.jw.gymmanager.util.Util;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/course")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/getCourses")
    public ResponseEntity<JResponse> getCourses() {
        return ResponseEntity.ok(courseService.getCourses(Util.getCurrentUid()));
    }

    @GetMapping("/getCourse/{id}")
    public ResponseEntity<JResponse> getCourse(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.getCoachCourse(id));
    }

    @PostMapping("/createCourse")
    public ResponseEntity<JResponse> createCourse(@RequestBody CourseEvent courseEvent) {
        return ResponseEntity.ok(courseService.createEditCourse(Util.getCurrentUid(), courseEvent));
    }

    @PutMapping("/editCourse")
    public ResponseEntity<JResponse> editCourse(@RequestBody CourseEvent courseEvent) {
        return ResponseEntity.ok(courseService.createEditCourse(Util.getCurrentUid(), courseEvent));
    }

    @DeleteMapping("/deleteCourse/{id}")
    public ResponseEntity<JResponse> deleteCourse(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.deleteCourse(Util.getCurrentUid(), id));
    }

}
