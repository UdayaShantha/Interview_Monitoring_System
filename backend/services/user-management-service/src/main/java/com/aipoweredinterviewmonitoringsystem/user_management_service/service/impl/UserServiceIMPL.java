package com.aipoweredinterviewmonitoringsystem.user_management_service.service.impl;

import com.aipoweredinterviewmonitoringsystem.user_management_service.dto.CandidateDTO;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.Candidate;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.User;
import com.aipoweredinterviewmonitoringsystem.user_management_service.entity.enums.UserType;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.CandidateRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.repository.UserRepository;
import com.aipoweredinterviewmonitoringsystem.user_management_service.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceIMPL implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public Candidate saveCandidate(CandidateDTO candidateDTO) {
        // Create and save User first
        User user = new User();
        user.setUsername(candidateDTO.getUser().getUsername());
        user.setPassword(candidateDTO.getUser().getPassword()); // Consider encoding password
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Create and save Candidate
        Candidate candidate = new Candidate();
        candidate.setUser(savedUser);
        candidate.setName(candidateDTO.getName());
        candidate.setPhone(candidateDTO.getPhone());
        candidate.setNic(candidateDTO.getNic());
        candidate.setAddress(candidateDTO.getAddress());
        candidate.setEmail(candidateDTO.getEmail());
        candidate.setBirthday(candidateDTO.getBirthday());
        candidate.setPositionType(candidateDTO.getPositionType());
        candidate.setPhotos(candidateDTO.getPhotos());
        return candidateRepository.save(candidate);
    }

    @Override
    public CandidateDTO getCandidateById(Long userId) {
        if (candidateRepository.existsById(userId)) {
            Candidate candidate = candidateRepository.findById(userId).get();
            CandidateDTO candidateDTO = modelMapper.map(candidate, CandidateDTO.class);
            return candidateDTO;
        } else {
            throw new RuntimeException("No candidate found with id " + userId);
        }

    }

    @Override
    public List<CandidateDTO> getAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<CandidateDTO> candidateDTOs = new ArrayList<>();
        for (Candidate candidate : candidates) {
            candidateDTOs.add(modelMapper.map(candidate, CandidateDTO.class));
        }

        return candidateDTOs;
    }

    @Override
    @Transactional
    public String deleteCandidate(Long userId) {
        candidateRepository.deleteById(userId);
        userRepository.deleteById(userId);


        return "Candidate with id: " + userId + " deleted";
    }

    @Override
    @Transactional
    public CandidateDTO updateCandidate(Long userId, CandidateDTO candidateDTO) {
        Candidate candidate = candidateRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No candidate found with id " + userId));

        updateCandidateFromDTO(candidate, candidateDTO);

        Candidate savedCandidate = candidateRepository.save(candidate);
        return modelMapper.map(savedCandidate, CandidateDTO.class);
    }

    private void updateCandidateFromDTO(Candidate candidate, CandidateDTO dto) {
        candidate.setName(dto.getName());
        candidate.setPhone(dto.getPhone());
        candidate.setNic(dto.getNic());
        candidate.setAddress(dto.getAddress());
        candidate.setEmail(dto.getEmail());
        candidate.setBirthday(dto.getBirthday());
        candidate.setPositionType(dto.getPositionType());
        candidate.setPhotos(dto.getPhotos());
    }
}



