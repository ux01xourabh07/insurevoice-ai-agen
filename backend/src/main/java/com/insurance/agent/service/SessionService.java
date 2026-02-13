package com.insurance.agent.service;

import com.insurance.agent.model.StoredSession;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SessionService {
    
    private final List<StoredSession> sessions = new ArrayList<>();
    
    public List<StoredSession> getAllSessions() {
        return sessions;
    }
    
    public StoredSession saveSession(StoredSession session) {
        session.setId(UUID.randomUUID().toString());
        sessions.add(0, session);
        return session;
    }
    
    public void clearSessions() {
        sessions.clear();
    }
}
