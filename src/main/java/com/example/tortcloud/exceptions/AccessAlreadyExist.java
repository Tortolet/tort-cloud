package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class AccessAlreadyExist extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public AccessAlreadyExist(String message) {
        super(message);
    }
}
