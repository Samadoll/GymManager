package com.jw.gymmanager.service;

import com.jw.gymmanager.entity.*;
import com.jw.gymmanager.repository.CourseRepository;
import com.jw.gymmanager.repository.RegistrationRepository;
import com.jw.gymmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    public JResponse getCourses(int currentUid) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        return JResponse.builder().status(200).data(getCourses(user.get())).build();
    }

    public JResponse getTodayCourses(int currentUid) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var now = new Date().getTime();
        var endOfDay = Date.from(LocalDate.now().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()).getTime();

        var courses = getCourses(user.get())
                .stream()
                .filter(t -> t.getEndTime() > now && t.getEndTime() < endOfDay && t.isPublished())
                .sorted(Comparator.comparingLong(CourseEvent::getStartTime))
                .collect(Collectors.toList());
        return JResponse.builder().status(200).data(courses).build();
    }

    private List<CourseEvent> getCourses(User user) {
        Optional<List<CourseEvent>> courses = Optional.empty();
        if (user.getRole() == Role.COACH) {
            courses = courseRepository.findCourseEventsByOwner(user);
        } else {
            var registrations = registrationRepository.findCourseRegistrationsByTrainee(user);
            if (registrations.isPresent()) {
                courses = courseRepository.findCourseEventsByCourseRegistrationsIn(registrations.get());
            }
        }
        return courses.orElseGet(ArrayList::new);
    }

    public JResponse getCoachCourse(int currentUserId, int id) {
        var u = userRepository.findById(currentUserId);
        if (u.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var user = userRepository.findById(id);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Coach Not Exist").build();
        var existedUser = user.get();

        var registrations = registrationRepository.findCourseRegistrationsByTrainee(existedUser).orElseGet(HashSet::new);
        var registeredEventId = registrations.stream().mapToInt(obj -> obj.getCourse().getId()).boxed().collect(Collectors.toSet());
        var courses = courseRepository.findCourseEventsByOwner(existedUser).orElseGet(ArrayList::new);
        courses = courses.stream().filter(t -> t.isPublished() && !registeredEventId.contains(t.getId())).toList();
        return JResponse.builder().status(200).data(courses).build();
    }

    public JResponse createEditCourse(int currentUid, CourseEvent courseEvent) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("User Not Exist").build();
        var existedUser = user.get();
        courseEvent.setOwner(existedUser);
        courseRepository.save(courseEvent);
        return JResponse.builder().status(200).data(courseEvent).build();
    }

    public JResponse deleteCourse(int currentUid, Integer id) {
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Not Allowed to Delete").build();
        var existedUser = user.get();
        var course = courseRepository.findCourseEventByIdAndOwner(id, existedUser);
        if (course.isPresent()) {
            courseRepository.deleteById(id);
            return JResponse.builder().status(200).data(id).build();
        }
        return JResponse.builder().status(400).message("Not Allowed to Delete").build();
    }

    public JResponse actionOnCourse(int currentUid, Integer eventId, String action) {
        if (!new HashSet<>(Arrays.asList("PUBLISH", "ACTIVATE", "CANCEL", "REGISTER", "DEREGISTER")).contains(action))
            return JResponse.builder().status(400).message("Not Allowed to " + action).build();
        var user = userRepository.findById(currentUid);
        if (user.isEmpty())
            return JResponse.builder().status(400).message("Not Allowed to " + action).build();
        var existedUser = user.get();
        var course = courseRepository.findById(eventId).orElseGet(null);
        if (course != null) {
            CourseEvent returnCourse = null;
            if (existedUser.getRole() == Role.COACH && existedUser.getId().equals(course.getOwner().getId())) {
                returnCourse = ownerActionOnCourse(course, action);
            } else if (existedUser.getRole() == Role.TRAINEE) {
                returnCourse = traineeActionOnCourse(existedUser, course, action);
            }
            if (returnCourse != null)
                return JResponse.builder().status(200).data(returnCourse).build();
        }
        return JResponse.builder().status(400).message("Not Allowed to " + action).build();
    }

    private CourseEvent ownerActionOnCourse(CourseEvent course, String action) {
        switch (action) {
            case "PUBLISH" -> course.setPublished(true);
            case "ACTIVATE" -> course.setStatus(CourseStatus.ACTIVE);
            case "CANCEL" -> course.setStatus(CourseStatus.CANCELLED);
        }
        return courseRepository.save(course);
    }

    private CourseEvent traineeActionOnCourse(User trainee, CourseEvent course, String action) {
        switch (action) {
            case "REGISTER" -> {
                if (course.getRegisteredSlots() < course.getAvailableSlots()) {
                    registrationRepository.save(CourseRegistration.builder().trainee(trainee).course(course).build());
                    course.setRegisteredSlots(course.getRegisteredSlots() + 1);
                    return courseRepository.save(course);
                }
            }
            case "DEREGISTER" -> {
                var registration = registrationRepository.findCourseRegistrationByCourseAndTrainee(course, trainee);
                if (registration.isPresent()) {
                    registrationRepository.delete(registration.get());
                    course.setRegisteredSlots(course.getRegisteredSlots() - 1);
                    return courseRepository.save(course);
                }
            }
        }
        return null;
    }
}
