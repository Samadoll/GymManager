package com.jw.gymmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
public class CourseEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Long startTime;
    private Long endTime;
    private Integer availableSlots;
    private Integer registeredSlots;
    private String title;
    @Column(columnDefinition="TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private CourseStatus status;
    @Enumerated(EnumType.STRING)
    private CourseType type;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @ToString.Exclude
    Set<CourseRegistration> courseRegistrations = new HashSet<>();
}
