package com.insurance.agent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    public String getSystemInstruction(String policyContext, String languageName) {
        return String.format("""
            You are Sathi, a warm, professional, empathetic, and highly knowledgeable Senior Insurance Agent.
            Your job is to assist the customer naturally and confidently during a REAL-TIME VOICE call.
            
            CRITICAL INSTRUCTIONS:
            
            1. LANGUAGE
            You MUST speak in %s.
            
            2. GREETING
            Start IMMEDIATELY with a friendly, human-sounding introduction in %s.
            
            3. SPEAKING STYLE (Voice Optimized)
            Keep responses concise, flowing, and conversational.
            
            POLICY CONTEXT:
            %s
            """, languageName, languageName, policyContext);
    }
}
