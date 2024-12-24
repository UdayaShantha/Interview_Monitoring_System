package entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "technical_team")
public class TechnicalTeam {
    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @MapsId
    private User user;

    private String name;
    private String specialization;
    private Integer experienceYears;
}
