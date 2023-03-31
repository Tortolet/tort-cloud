package com.example.tortcloud.exceptions;

import java.time.LocalDateTime;

public record ErrorMessage(int statusCode, LocalDateTime timestamp, String message, String description) {
}
