package com.aipoweredinterviewmonitoringsystem.report_generation_service.dto.request;

import java.time.LocalDate;

public class GetInterviewDetailsDTO {
    private long candidateId;
    private LocalDate scheduleDate;
    private double duration;

    public GetInterviewDetailsDTO(long candidateId, LocalDate scheduleDate, double duration) {
        this.candidateId = candidateId;
        this.scheduleDate = scheduleDate;
        this.duration = duration;
    }

    public GetInterviewDetailsDTO() {
    }

    public long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(long candidateId) {
        this.candidateId = candidateId;
    }

    public LocalDate getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDate scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }
}
