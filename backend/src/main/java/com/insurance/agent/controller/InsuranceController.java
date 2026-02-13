package com.insurance.agent.controller;

import com.insurance.agent.model.PolicyRequest;
import com.insurance.agent.model.StoredSession;
import com.insurance.agent.service.GeminiService;
import com.insurance.agent.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InsuranceController {
    
    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private SessionService sessionService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
    
    @PostMapping("/policy/instruction")
    public ResponseEntity<Map<String, String>> getInstruction(@RequestBody PolicyRequest request) {
        String instruction = geminiService.getSystemInstruction(
            request.getPolicyText(), 
            request.getLanguage()
        );
        return ResponseEntity.ok(Map.of("instruction", instruction));
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<List<StoredSession>> getSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }
    
    @PostMapping("/sessions")
    public ResponseEntity<StoredSession> saveSession(@RequestBody StoredSession session) {
        return ResponseEntity.ok(sessionService.saveSession(session));
    }
    
    @DeleteMapping("/sessions")
    public ResponseEntity<Void> clearSessions() {
        sessionService.clearSessions();
        return ResponseEntity.ok().build();
    }
}
