package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class AccessDenied extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public AccessDenied(String message) {
        super(message);
    }
}
