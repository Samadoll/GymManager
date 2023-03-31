package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.JResponse;
import com.jw.gymmanager.entity.Role;
import com.jw.gymmanager.entity.User;
import com.jw.gymmanager.repository.CourseRepository;
import com.jw.gymmanager.repository.RegistrationRepository;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    public JResponse getCourse(int currentUid) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        Optional<List<CourseEvent>> courses;
        if (existedUser.getRole() == Role.COACH) {
            courses = courseRepository.findCourseEventsByOwner(existedUser);
        } else {
            var registrations = registrationRepository.findCourseRegistrationsByTrainee(existedUser);
            if (registrations.isEmpty()) {
                return JResponse.builder().status(200).data(new ArrayList<>()).build();
            }
            courses = courseRepository.findCourseEventsByCourseRegistrationsIn(registrations.get());
        }
        return JResponse.builder().status(200).data(courses.isPresent() ? courses.get() : new ArrayList<>()).build();
    }

    public JResponse createCourse(int currentUid, CourseEvent courseEvent) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        courseEvent.setOwner(existedUser);
        courseRepository.save(courseEvent);
        return JResponse.builder().status(200).data(courseEvent.getId()).build();
    }
}
