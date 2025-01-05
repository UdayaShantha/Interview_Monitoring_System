package com.aipoweredinterviewmonitoringsystem.question_management_service.controller;

import com.aipoweredinterviewmonitoringsystem.question_management_service.entity.Keyword;
import com.aipoweredinterviewmonitoringsystem.question_management_service.service.KeywordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/keywords")
public class KeywordController {

    @Autowired
    private KeywordService keywordService;

    // Endpoint to save a new keyword
    @PostMapping
    public ResponseEntity<Keyword> saveKeyword(@RequestBody Keyword keyword) {
        Keyword savedKeyword = keywordService.saveKeyword(keyword);
        return ResponseEntity.ok(savedKeyword);
    }

    // Endpoint to retrieve all keywords
    @GetMapping
    public ResponseEntity<List<Keyword>> getAllKeywords() {
        List<Keyword> keywords = keywordService.getAllKeywords();
        return ResponseEntity.ok(keywords);
    }

    // Endpoint to retrieve a keyword by ID
    @GetMapping("/{id}")
    public ResponseEntity<Keyword> getKeywordById(@PathVariable Long id) {
        Keyword keyword = keywordService.getKeywordById(id);
        if (keyword != null) {
            return ResponseEntity.ok(keyword);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to update a keyword
    @PutMapping("/{id}")
    public ResponseEntity<Optional<Keyword>> updateKeyword(@PathVariable Long id, @RequestBody Keyword updatedKeyword) {
        Optional<Keyword> keyword = keywordService.updateKeyword(id);
        if (keyword != null) {
            return ResponseEntity.ok(keyword);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to delete a keyword by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKeyword(@PathVariable Long id) {
        keywordService.deleteKeyword(id);
        return ResponseEntity.noContent().build();
    }
}
