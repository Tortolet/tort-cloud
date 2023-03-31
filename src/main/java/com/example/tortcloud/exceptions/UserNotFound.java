package com.example.tortcloud.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class UserNotFound extends RuntimeException {
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }

    public UserNotFound(String message){
        super(message);
    }
}