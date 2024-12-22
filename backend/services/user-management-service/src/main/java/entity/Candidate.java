package entity;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "candidates")
public class Candidate {
    @Id
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id")
    @MapsId
    private User user;

    private String name;
    private String phone;
    private String interviewStatus;

    @Column(name = "created_by")
    private Long createdBy;

    @ElementCollection
    @CollectionTable(name = "candidate_photos")
    private List<byte[]> photos;

    @ManyToOne
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private HrTeam hrTeam;
}
