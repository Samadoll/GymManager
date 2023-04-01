package com.jw.gymmanager.repository;


import com.jw.gymmanager.entity.CourseEvent;
import com.jw.gymmanager.entity.CourseRegistration;
import com.jw.gymmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CourseRepository extends JpaRepository<CourseEvent, Integer> {
    Optional<List<CourseEvent>> findCourseEventsByOwner(User user);
    Optional<List<CourseEvent>> findCourseEventsByOwnerAndCourseRegistrationsNotIn(User user, Set<CourseRegistration> registrations);
    Optional<List<CourseEvent>> findCourseEventsByOwnerAndIdNotIn(User user, Set<Integer> eventIds);
    Optional<List<CourseEvent>> findCourseEventsByCourseRegistrationsIn(Set<CourseRegistration> registrations);
    Optional<CourseEvent> findCourseEventByIdAndOwner(Integer id, User owner);
}
