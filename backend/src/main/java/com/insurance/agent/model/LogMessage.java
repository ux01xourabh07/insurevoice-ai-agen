package com.insurance.agent.model;

import lombok.Data;
import java.util.Date;

@Data
public class LogMessage {
    private Date timestamp;
    private String role;
    private String message;
}
