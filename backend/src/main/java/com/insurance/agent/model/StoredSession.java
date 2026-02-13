package com.insurance.agent.model;

import lombok.Data;
import java.util.List;

@Data
public class StoredSession {
    private String id;
    private String timestamp;
    private List<LogMessage> logs;
    private String policySummary;
}
