package com.aipoweredinterviewmonitoringsystem.interview_management_service.repository;

import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.Interview;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Result;
import com.aipoweredinterviewmonitoringsystem.interview_management_service.entity.enums.Status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
class InterviewRepositoryTest {

    @Autowired
    private InterviewRepository interviewRepository;

    @Test
    public void InterviewRepository_Save_ReturnSavedInterview() {
        // Arrange
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MILLIS); // Truncate to milliseconds
        LocalDate today = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS); // Truncate to milliseconds

        Interview interview = Interview.builder()
                .candidateId(1L)
                .status(Status.UPCOMING)
                .result(Result.PENDING)
                .endTime(now.plusHours(1)) // Set end time to 1 hour after start time
                .duration(1.0) // Set duration to 1 hour
                .createdAt(createdAt)
                .scheduleDate(today)
                .startTime(now)
                .build();

        // Act
        Interview savedInterview = interviewRepository.save(interview);

        // Assert
        assertNotNull(savedInterview);
        assertNotNull(savedInterview.getInterviewId()); // Ensure ID is auto-generated
        assertEquals(1L, savedInterview.getCandidateId());
        assertEquals(Status.UPCOMING, savedInterview.getStatus());
        assertEquals(Result.PENDING, savedInterview.getResult());
        assertEquals(today, savedInterview.getScheduleDate());
        assertEquals(now, savedInterview.getStartTime().truncatedTo(ChronoUnit.MILLIS)); // Truncate for comparison
        assertEquals(now.plusHours(1), savedInterview.getEndTime().truncatedTo(ChronoUnit.MILLIS)); // Truncate for comparison
        assertEquals(1.0, savedInterview.getDuration());
        assertEquals(createdAt, savedInterview.getCreatedAt().truncatedTo(ChronoUnit.MILLIS)); // Truncate for comparison
        assertThat(savedInterview.getInterviewId()).isGreaterThan(0L).isNotNull(); // Ensure ID is auto-generated and valid
    }


    @Test
    public void InterviewRepository_FindAll_ReturnsAllInterviews() {
        // Arrange
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MILLIS);
        LocalDate today = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS);

        Interview interview1 = Interview.builder()
                .candidateId(1L)
                .status(Status.UPCOMING)
                .result(Result.PENDING)
                .endTime(now.plusHours(1))
                .duration(1.0)
                .createdAt(createdAt)
                .scheduleDate(today)
                .startTime(now)
                .build();

        Interview interview2 = Interview.builder()
                .candidateId(2L)
                .status(Status.COMPLETED)
                .result(Result.SELECTED)
                .endTime(now.plusHours(2))
                .duration(1.5)
                .createdAt(createdAt)
                .scheduleDate(today)
                .startTime(now.plusHours(1))
                .build();

        // Save test data
        interviewRepository.save(interview1);
        interviewRepository.save(interview2);

        // Act
        List<Interview> interviews = interviewRepository.findAll();

        // Assert
        assertFalse(interviews.isEmpty()); // Ensure the list is not empty
        assertEquals(2, interviews.size()); // Ensure the list contains exactly 2 interviews
    }

    @Test
    public void InterviewRepository_FindById_ReturnsInterview() {
        // Arrange
        LocalTime now = LocalTime.now().truncatedTo(ChronoUnit.MILLIS);
        LocalDate today = LocalDate.now();
        LocalDateTime createdAt = LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS);

        Interview interview = Interview.builder()
                .candidateId(1L)
                .status(Status.UPCOMING)
                .result(Result.PENDING)
                .endTime(now.plusHours(1))
                .duration(1.0)
                .createdAt(createdAt)
                .scheduleDate(today)
                .startTime(now)
                .build();

        // Save the interview
        Interview savedInterview = interviewRepository.save(interview);

        // Act
        Optional<Interview> foundInterview = interviewRepository.findById(savedInterview.getInterviewId());

        // Assert
        assertTrue(foundInterview.isPresent()); // Ensure the interview is found
        assertEquals(savedInterview.getInterviewId(), foundInterview.get().getInterviewId()); // Verify the ID matches
        assertEquals(savedInterview.getCandidateId(), foundInterview.get().getCandidateId()); // Verify other fields
        assertEquals(savedInterview.getStatus(), foundInterview.get().getStatus());
        assertEquals(savedInterview.getResult(), foundInterview.get().getResult());
        assertEquals(savedInterview.getScheduleDate(), foundInterview.get().getScheduleDate());
        assertEquals(savedInterview.getStartTime().truncatedTo(ChronoUnit.MILLIS), foundInterview.get().getStartTime().truncatedTo(ChronoUnit.MILLIS));
        assertEquals(savedInterview.getEndTime().truncatedTo(ChronoUnit.MILLIS), foundInterview.get().getEndTime().truncatedTo(ChronoUnit.MILLIS));
        assertEquals(savedInterview.getDuration(), foundInterview.get().getDuration());
        assertEquals(savedInterview.getCreatedAt().truncatedTo(ChronoUnit.MILLIS), foundInterview.get().getCreatedAt().truncatedTo(ChronoUnit.MILLIS));
    }

    @Test
    public void InterviewRepository_FindById_ReturnsEmpty() {
        Optional<Interview> interview = interviewRepository.findById(100L);
        assertNotNull(interview);
        assertFalse(interview.isPresent());
    }

    @Test
    public void InterviewRepository_DeleteById_ReturnsDeletedInterview() {
        Interview interview = Interview.builder()
                .candidateId(1L)
                .status(Status.UPCOMING)
                .result(Result.PENDING)
                .scheduleDate(LocalDate.now())
                .startTime(LocalTime.now())
                .endTime(LocalTime.now().plusHours(1))
                .build();
        Interview savedInterview = interviewRepository.save(interview);
        assertNotNull(savedInterview);
        interviewRepository.deleteById(savedInterview.getInterviewId());
        Optional<Interview> deletedInterview = interviewRepository.findById(savedInterview.getInterviewId());
        assertNotNull(deletedInterview);
        assertFalse(deletedInterview.isPresent());
    }
}