package com.jw.gymmanager.entity;

import com.jw.gymmanager.enums.QuotaState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table
public class Quota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "coach_id", referencedColumnName = "id")
    private User coach;
    @ManyToOne
    @JoinColumn(name = "trainee_id", referencedColumnName = "id")
    private User trainee;
    private Integer quota;
    private QuotaState quotaState;
}
