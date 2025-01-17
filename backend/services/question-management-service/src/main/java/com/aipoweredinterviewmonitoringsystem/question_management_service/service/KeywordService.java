package com.aipoweredinterviewmonitoringsystem.question_management_service.service;

import com.aipoweredinterviewmonitoringsystem.question_management_service.repository.KeywordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KeywordService {
    @Autowired
    private KeywordRepository keywordRepository;

    // Save a new keyword
    public Keyword saveKeyword(Keyword keyword) {
        return keywordRepository.save(keyword);
    }

    // Retrieve all keywords
    public List<Keyword> getAllKeywords() {
        return keywordRepository.findAll();
    }

    // Retrieve a keyword by ID
    public Keyword getKeywordById(Long id) {
        return keywordRepository.findById(id).orElse(null);
    }

    // Update a keyword
    public Optional<Keyword> updateKeyword(Long id) {
        return keywordRepository.findById(id);

    }

    // Delete a keyword by ID
    public void deleteKeyword(Long id) {
        keywordRepository.deleteById(id);
    }
}
